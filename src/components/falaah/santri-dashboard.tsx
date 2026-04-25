
"use client"

import { useState, useEffect } from "react";
import { UserProfile, IbadahLog } from "@/lib/types";
import { 
  getRankByExp, 
  getNextRank, 
  EXP_VALUES 
} from "@/lib/constants";
import { 
  Trophy,
  BrainCircuit,
  Target,
  Headphones,
  BookOpen,
  ScrollText,
  HandHeart,
  CheckCircle2,
  LayoutDashboard,
  Clock,
  ArrowRight,
  ChevronRight,
  Flame,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getPersonalizedMotivation } from "@/ai/flows/personalized-motivation-ai";
import { cn } from "@/lib/utils";

interface SantriDashboardProps {
  user: UserProfile;
  initialLog: IbadahLog;
}

type SantriTab = 'ringkasan' | 'tugas-guru' | 'talaqqi' | 'tahfidz' | 'hadits' | 'doa' | 'mutabaah' | 'rank';

export function SantriDashboard({ user, initialLog }: SantriDashboardProps) {
  const [activeTab, setActiveTab] = useState<SantriTab>('ringkasan');
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  const currentRank = getRankByExp(user.totalExp);
  const nextRank = getNextRank(user.totalExp);
  const expProgress = nextRank ? ((user.totalExp - currentRank.minExp) / (nextRank.minExp - currentRank.minExp)) * 100 : 100;
  const expNeeded = nextRank ? nextRank.minExp - user.totalExp : 0;

  useEffect(() => {
    async function fetchMotivation() {
      setLoadingMotivation(true);
      try {
        const result = await getPersonalizedMotivation({
          name: user.name,
          currentExp: user.totalExp,
          expNeededForNextRank: expNeeded,
          nextRankName: nextRank?.name || "Peringkat Maksimal",
          suggestedActivity: "Tugas Hafalan Baru"
        });
        setMotivation(result.message);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMotivation(false);
      }
    }
    if (activeTab === 'ringkasan') fetchMotivation();
  }, [user.totalExp, expNeeded, nextRank?.name, user.name, activeTab]);

  const navItems = [
    { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'tugas-guru', label: 'Tugas Guru', icon: Target },
    { id: 'talaqqi', label: 'Talaqqi', icon: Headphones },
    { id: 'tahfidz', label: 'Tahfidz', icon: BookOpen },
    { id: 'hadits', label: 'Hadits', icon: ScrollText },
    { id: 'doa', label: 'Do\'a', icon: HandHeart },
    { id: 'mutabaah', label: 'Mutaba\'ah', icon: CheckCircle2 },
    { id: 'rank', label: 'Rank', icon: Trophy },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Sub-Navigation Bar */}
      <Card className="glass-card border-none bg-card/40 overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex p-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SantriTab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "bg-transparent text-muted-foreground hover:bg-white/5"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>

      {activeTab === 'ringkasan' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header Summary Card */}
          <Card className="glass-card overflow-hidden border-none relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-destructive"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <span className="text-3xl">{currentRank.icon}</span>
                    {currentRank.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    {user.totalExp.toLocaleString()} Total EXP
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 mb-1">
                    <Flame className="w-3 h-3 mr-1 fill-current" />
                    {user.streak} Hari Streak
                  </Badge>
                  {nextRank && (
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider block">
                      {expNeeded.toLocaleString()} EXP lagi ke {nextRank.name}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={expProgress} className="h-3 bg-secondary" />
              
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-start cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setActiveTab('tugas-guru')}>
                <div className="bg-primary/20 p-2 rounded-lg">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm italic leading-relaxed text-foreground/90">
                    {loadingMotivation ? "Menghubungi Ustadz AI..." : motivation}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card p-4 flex flex-col items-center justify-center text-center space-y-2 border-primary/20">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Tugas Menunggu</div>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setActiveTab('tugas-guru')}>
                Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Card>

            <Card className="glass-card p-4 flex flex-col items-center justify-center text-center space-y-2 border-accent/20">
              <Clock className="w-8 h-8 text-accent" />
              <div>
                <div className="text-2xl font-bold">85%</div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Kehadiran Talaqqi</div>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setActiveTab('talaqqi')}>
                Detail Absensi <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Card>

            <Card className="glass-card p-4 flex flex-col items-center justify-center text-center space-y-2 border-destructive/20">
              <BookOpen className="w-8 h-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">Juz 30</div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Capaian Tahfidz</div>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setActiveTab('tahfidz')}>
                Jurnal Hafalan <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Card>
          </div>
        </div>
      ) : activeTab === 'tugas-guru' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Tasks Page Content - Following Image Request */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-xl shadow-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
                Tugas Hafalan dari Guru
              </h2>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Setor hafalan untuk setiap target yang diberikan gurumu.
              </p>
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="rounded-full bg-primary text-primary-foreground font-bold">
              Semua (0)
            </Button>
            <Button size="sm" variant="outline" className="rounded-full bg-card/50">
              ⏳ Belum Setor
            </Button>
            <Button size="sm" variant="outline" className="rounded-full bg-card/50">
              🕒 Menunggu Nilai
            </Button>
            <Button size="sm" variant="outline" className="rounded-full bg-card/50">
              ✅ Sudah Dinilai
            </Button>
          </div>

          {/* Empty State / Task List Placeholder */}
          <Card className="glass-card border-dashed border-2 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Target className="w-12 h-12 mb-4 opacity-20" />
            <p>Belum ada tugas hafalan yang diberikan hari ini.</p>
            <Button variant="link" className="text-primary mt-2">Segarkan Halaman</Button>
          </Card>
        </div>
      ) : (
        <Card className="glass-card p-12 text-center animate-in fade-in duration-300">
          <p className="text-muted-foreground">Halaman {activeTab} sedang dalam pengembangan.</p>
          <Button variant="outline" className="mt-4" onClick={() => setActiveTab('ringkasan')}>
            Kembali ke Ringkasan
          </Button>
        </Card>
      )}

      <footer className="text-center pt-8">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50">
          Dikembangkan untuk Rumah Tahfidz Ikhsan
        </p>
      </footer>
    </div>
  );
}
