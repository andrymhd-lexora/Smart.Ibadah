"use client"

import { Mail, Heart, Sparkles, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function Footer() {
  const handleDonate = () => {
    toast({
      title: "Niat Mulia Terdeteksi!",
      description: "Membuka portal donasi Markas Besar. Terima kasih atas semangat pahlawanmu!",
    });
    
    // Membuka link donasi di tab baru
    window.open("http://lynk.id/lexorabizhub/plxk099wd431/checkout", "_blank");
  };

  return (
    <footer className="w-full py-12 mt-auto border-t border-white/5 bg-[#09090b]/80 backdrop-blur-xl relative overflow-hidden">
      {/* Decorative Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 blur-[100px] -z-10 rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-8">
        {/* Donation Section */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent via-yellow-500 to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <Button 
            onClick={handleDonate}
            className="relative h-14 px-8 bg-black/40 border border-white/10 hover:bg-black/60 rounded-2xl transition-all duration-500 flex items-center gap-3 overflow-hidden"
          >
            <div className="bg-accent/20 p-2 rounded-lg">
              <Coins className="w-5 h-5 text-accent animate-bounce" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/80 leading-none mb-1">Dukung Peradaban</p>
              <p className="text-sm font-headline font-black text-white uppercase tracking-tighter">Donasi Pengembangan</p>
            </div>
            <div className="ml-4 p-2 rounded-full bg-white/5 group-hover:bg-accent group-hover:text-white transition-colors">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </Button>
        </div>

        {/* Developer Credits */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-8 bg-white/10"></div>
            <Sparkles className="w-4 h-4 text-primary opacity-50" />
            <div className="h-[1px] w-8 bg-white/10"></div>
          </div>
          
          <p className="text-[11px] md:text-xs text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-80">
            Dikembangkan dengan <Heart className="w-3 h-3 inline text-destructive fill-current mx-1 animate-pulse" /> oleh <span className="text-primary font-bold">andry.mhd@gmail.com</span> @2026
          </p>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest italic">
            — Rumah Tahfidz Ikhsan —
          </p>
          
          <div className="flex justify-center pt-4">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
