"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useMemo } from "react";

export function TEEStatus() {
  // Simulate active TEE status (in real app, fetch from teeClient)
  const isActive = useMemo(() => true, []);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {/* Pulsing halo when active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-500/30"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Status indicator */}
        <div
          className={`relative h-8 w-8 rounded-full flex items-center justify-center transition-all ${
            isActive
              ? "bg-emerald-500/20 border border-emerald-500"
              : "bg-slate-600/20 border border-slate-600"
          }`}
        >
          <Shield className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
        </div>
      </div>

      {/* Status text */}
      <span className="text-xs">
        <span className={`font-semibold ${isActive ? "text-emerald-400" : "text-slate-400"}`}>
          TEE
        </span>
        <span className="text-muted"> {isActive ? "Active" : "Inactive"}</span>
      </span>
    </div>
  );
}
