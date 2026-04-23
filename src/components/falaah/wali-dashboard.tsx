"use client"

import { useState } from "react";
import { UserProfile } from "@/lib/types";
import { getRankByExp } from "@/lib/constants";
import { 
  Heart, 
  Search, 
  Activity, 
  Award, 
  Flame, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  TrendingUp,
  Link as LinkIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const MOCK_CHILD: UserProfile = {
  uid: 'child-1',
  name: 'Ahmad Faiz',
  email: 'faiz@example.com',
  role: 'santri',
  totalExp: 32550,
  streak: 15
};

export function WaliDashboard() {
  const [studentId, setStudentId] = useState("");
  const [linked, setLinked] = useState(true);

  const childRank = getRankByExp(MOCK_CHILD.totalExp);

  const handleLink = () => {
    if (!studentId) return;
    setLinked(true);
    toast({
      title: "Santri Terhubung!",
      description: `Berhasil terhubung dengan ID Santri ${studentId}.`,
    });
  };

  if (!linked) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Hubungkan Santri
            </CardTitle>
            <CardDescription>Masukkan ID Santri anak Anda untuk mulai memantau.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input 
                placeholder="RTI-2024-XXXX" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)}
                className="bg-secondary/30"
              />
            </div>
            <Button className="w-full bg-primary font-bold" onClick={handleLink}>Hubungkan Akun</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="bg-primary/20 p-3 rounded-full">
          <Heart className="w-6 h-6 text-primary fill-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-headline font-bold">Pemantauan Wali</h2>
          <p className="text-muted-foreground text-sm">Pembaruan waktu nyata untuk <span className="text-foreground font-bold">{MOCK_CHILD.name}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card md:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">Status Saat Ini</CardTitle>
              <Badge className="bg-orange-500/10 text-orange-500 border-none">
                <Flame className="w-3 h-3 mr-1 fill-current" />
                {MOCK_CHILD.streak} Hari
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center pt-4">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-card border-4 border-primary rounded-full text-5xl">
                  {childRank.icon}
                </div>
              </div>
              <h3 className="text-xl font-headline font-bold text-accent uppercase">{childRank.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{MOCK_CHILD.totalExp.toLocaleString()} Total EXP</p>
            </div>
            
            <div className="space-y-2 text-left pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progres Bulanan</span>
                <span className="text-primary font-bold">+1,200 EXP</span>
              </div>
              <Progress value={65} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Riwayat Aktivitas
            </CardTitle>
            <CardDescription>Aktivitas ibadah yang baru saja diselesaikan hari ini</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {[
                { activity: 'Sholat Maghrib', time: '18:15', exp: 50, icon: <CheckCircle2 className="w-4 h-4 text-primary" /> },
                { activity: 'Setoran Hafalan Al-Kauthar', time: '16:30', exp: 200, icon: <Award className="w-4 h-4 text-accent" /> },
                { activity: 'Sholat Ashar', time: '15:20', exp: 50, icon: <CheckCircle2 className="w-4 h-4 text-primary" /> },
                { activity: 'Tilawah (2 Halaman)', time: '14:45', exp: 200, icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.activity}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-primary/20 text-primary">+{item.exp} EXP</Badge>
                </div>
              ))}
            </div>
            <div className="p-4 text-center">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Lihat Riwayat Lengkap <ChevronRight className="w-3 h-3 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center pt-8">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50">
          Dikembangkan untuk Rumah Tahfidz Ikhsan
        </p>
      </footer>
    </div>
  );
}
