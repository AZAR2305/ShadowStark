/**
 * BTC Testnet4 Client — via Mempool.space public API
 * No API key required. CORS-friendly from browser.
 * Falls back to multiple external sources if primary fails.
 *
 * Base URL: https://mempool.space/testnet4/api
 */

// Ensure BASE_URL is always a valid string
const BASE_URL = (() => {
  const url = process.env.NEXT_PUBLIC_BTC_RPC_URL || "https://mempool.space/testnet4/api";
  // Validate it starts with https:// or http://
  if (url && (url.startsWith("https://") || url.startsWith("http://"))) {
    return url;
  }
  return "https://mempool.space/testnet4/api";
})();

const EXPLORER_URL =
  process.env.NEXT_PUBLIC_BTC_EXPLORER_URL ?? "https://mempool.space/testnet4";

// Fallback sources for BTC balance queries
const FALLBACK_SOURCES = [
  "https://mempool.space/testnet4/api",
  "https://blockstream.info/testnet4/api",
  // Note: blockchain.info doesn't provide testnet4, but we keep it as a reference
];

export interface BtcUtxo {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_hash?: string;
    block_time?: number;
  };
  value: number; // sats
}

export interface BtcBalance {
  confirmed: number;   // sats
  unconfirmed: number; // sats
  totalBtc: string;    // formatted "X.XXXXXXXX BTC"
}

export interface BtcAddressStats {
  address: string;
  chain_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
  mempool_stats: {
    funded_txo_count: number;
    funded_txo_sum: number;
    spent_txo_count: number;
    spent_txo_sum: number;
    tx_count: number;
  };
}

function satsToBtc(sats: number): string {
  return (sats / 1e8).toFixed(8);
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  // Validate path
  if (!path || typeof path !== "string" || !path.startsWith("/")) {
    throw new Error(`Invalid API path: ${path}`);
  }

  const url = `${BASE_URL}${path}`;
  
  // Validate final URL
  try {
    new URL(url);
  } catch (err) {
    console.error(`[btcClient] Invalid URL constructed: ${url}, BASE_URL=${BASE_URL}, path=${path}`);
    throw new Error(`Invalid URL: ${url}`);
  }

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`BTC API error ${res.status} at ${url}: ${text}`);
    }

    // /tx broadcast returns plain text txid
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return res.json() as Promise<T>;
    }
    return res.text() as unknown as T;
  } catch (err) {
    console.error(`[btcClient] Failed to fetch from ${url}:`, err);
    throw err;
  }
}

/**
 * Try fetching from multiple external sources
 * Useful when primary API is down
 */
async function apiFetchWithFallback<T>(path: string, init?: RequestInit, sources?: string[]): Promise<T> {
  const sourcesToTry = sources || [BASE_URL, ...FALLBACK_SOURCES];
  const errors: string[] = [];

  for (const source of sourcesToTry) {
    try {
      if (!source || typeof source !== "string" || !source.startsWith("http")) {
        errors.push(`Invalid source URL: ${source}`);
        continue;
      }

      const url = `${source}${path}`;
      const res = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          ...init?.headers,
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        errors.push(`${source}: HTTP ${res.status}`);
        continue;
      }

      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        console.log(`[btcClient] Successfully fetched from ${source}`);
        return res.json() as Promise<T>;
      }
      return res.text() as unknown as T;
    } catch (err) {
      errors.push(`${source}: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }
  }

  // All sources failed
  throw new Error(
    `[btcClient] Failed to fetch ${path} from all sources:\n${errors.join("\n")}`
  );
}

class BtcClient {
  /**
   * Fetch confirmed + unconfirmed balance for a Bitcoin address.
   * Works with any testnet4 address format (Legacy P2PKH, P2SH, Bech32 P2WPKH, Bech32m P2TR).
   * Falls back to external sources if primary API fails.
   */
  async getBalance(address: string): Promise<BtcBalance> {
    let stats: BtcAddressStats;
    
    try {
      // Try primary source first
      stats = await apiFetch<BtcAddressStats>(`/address/${address}`);
    } catch (primaryErr) {
      console.warn(`[btcClient] Primary source failed, trying fallback sources:`, primaryErr);
      // Fall back to trying multiple sources
      try {
        stats = await apiFetchWithFallback<BtcAddressStats>(`/address/${address}`);
      } catch (fallbackErr) {
        console.error(`[btcClient] All sources failed for balance fetch:`, fallbackErr);
        // Return default zero balance if all sources fail
        return {
          confirmed: 0,
          unconfirmed: 0,
          totalBtc: "0.00000000",
        };
      }
    }

    const confirmedFunded = stats.chain_stats.funded_txo_sum;
    const confirmedSpent = stats.chain_stats.spent_txo_sum;
    const confirmed = confirmedFunded - confirmedSpent;

    const mempoolFunded = stats.mempool_stats.funded_txo_sum;
    const mempoolSpent = stats.mempool_stats.spent_txo_sum;
    const unconfirmed = mempoolFunded - mempoolSpent;

    return {
      confirmed,
      unconfirmed,
      totalBtc: satsToBtc(Math.max(0, confirmed + unconfirmed)),
    };
  }

  /**
   * Fetch UTXOs for a Bitcoin address.
   * Used for PSBT (Partially Signed Bitcoin Transaction) construction.
   * Falls back to external sources if primary fails.
   */
  async getUtxos(address: string): Promise<BtcUtxo[]> {
    try {
      return await apiFetch<BtcUtxo[]>(`/address/${address}/utxo`);
    } catch (err) {
      console.warn(`[btcClient] Primary source failed for UTXOs, trying fallback:`, err);
      try {
        return await apiFetchWithFallback<BtcUtxo[]>(`/address/${address}/utxo`);
      } catch (fallbackErr) {
        console.error(`[btcClient] All sources failed for UTXO fetch:`, fallbackErr);
        return [];
      }
    }
  }

  /**
   * Fetch recent transaction IDs for an address.
   * Falls back to external sources if primary fails.
   */
  async getTxHistory(address: string): Promise<string[]> {
    try {
      const txs = await apiFetch<Array<{ txid: string }>>(`/address/${address}/txs`);
      return txs.map((tx) => tx.txid);
    } catch (err) {
      console.warn(`[btcClient] Primary source failed for TX history, trying fallback:`, err);
      try {
        const txs = await apiFetchWithFallback<Array<{ txid: string }>>(`/address/${address}/txs`);
        return txs.map((tx) => tx.txid);
      } catch (fallbackErr) {
        console.error(`[btcClient] All sources failed for TX history:`, fallbackErr);
        return [];
      }
    }
  }

  /**
   * Broadcast a raw Bitcoin transaction (hex-encoded) to testnet4.
   * Returns the txid on success.
   */
  async broadcastTx(rawHex: string): Promise<string> {
    const txid = await apiFetch<string>("/tx", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: rawHex,
    });
    return txid.trim();
  }

  /**
   * Get the Mempool.space explorer URL for a transaction.
   */
  getTxExplorerUrl(txid: string): string {
    return `${EXPLORER_URL}/tx/${txid}`;
  }

  /**
   * Get the Mempool.space explorer URL for a Bitcoin address.
   */
  getAddressExplorerUrl(address: string): string {
    return `${EXPLORER_URL}/address/${address}`;
  }

  /**
   * Estimate fee rate (sat/vB) from Mempool.space fee estimates.
   * Returns { fastest, halfHour, hour } in sat/vB.
   */
  async getFeeEstimates(): Promise<Record<string, number>> {
    return apiFetch<Record<string, number>>("/v1/fees/recommended");
  }
}

export const btcClient = new BtcClient();
