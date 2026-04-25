"use client"

import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-white/5 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
        <p className="text-[11px] md:text-xs text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-70">
          Dikembangkan oleh <span className="text-primary">andry.mhd@gmail.com</span> @2026 untuk <span className="text-foreground">Rumah Tahfidz Ikhsan</span>
        </p>
        <p className="text-[10px] text-muted-foreground/50 italic">
          — Hak Cipta Dilindungi Undang Undang —
        </p>
        <div className="flex justify-center pt-2">
          <div className="h-1 w-12 bg-primary/30 rounded-full"></div>
        </div>
      </div>
    </footer>
  );
}
