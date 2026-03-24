"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { compileCommitment } from "@/lib/commitment";
import type { Strategy } from "@/types";

interface CompileButtonProps {
  strategy: Strategy;
  disabled?: boolean;
  onCompiled: (commitment: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function CompileButton({ strategy, disabled, onCompiled, onLoadingChange }: CompileButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      disabled={disabled || loading}
      onClick={async () => {
        setLoading(true);
        onLoadingChange?.(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 1400));
          const commitment = compileCommitment(strategy);
          onCompiled(commitment);
        } finally {
          setLoading(false);
          onLoadingChange?.(false);
        }
      }}
    >
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Compile to ZK →
    </Button>
  );
}
