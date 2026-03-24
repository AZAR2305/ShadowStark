"use client";

import { Shield } from "lucide-react";

export function TEEStatus({ active }: { active: boolean }) {
  return (
    <div className="mt-2 flex items-center gap-2 rounded-md border border-border bg-elevated px-2 py-1 text-xs">
      <span className={`h-2 w-2 rounded-full ${active ? "bg-public animate-pulse" : "bg-muted"}`} />
      <span className={active ? "text-public" : "text-secondary"}>TEE: {active ? "Active" : "Offline"}</span>
      <Shield className={`ml-auto h-3.5 w-3.5 ${active ? "text-public" : "text-muted"}`} />
    </div>
  );
}
