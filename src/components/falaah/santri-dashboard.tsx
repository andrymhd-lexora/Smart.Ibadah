"use client"

import { useState, useEffect, useRef } from "react";
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
  Star,
  Play,
  Pause,
  Volume2,
  Search,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { getPersonalizedMotivation } from "@/ai/flows/personalized-motivation-ai";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface SantriDashboardProps {
  user: UserProfile;
  initialLog: IbadahLog;
}

type SantriTab = 'ringkasan' | 'tugas-guru' | 'talaqqi' | 'tahfidz' | 'hadits' | 'doa' | 'mutabaah' | 'rank';

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  revelationType: string;
  totalVerses: number;
}

const SURAHS: Surah[] = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", revelationType: "Pembukaan", totalVerses: 7 },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", revelationType: "Sapi", totalVerses: 286 },
  { number: 3, name: "Ali 'Imran", arabicName: "آl عمران", revelationType: "Keluarga Imran", totalVerses: 200 },
  { number: 4, name: "An-Nisa'", arabicName: "النساء", revelationType: "Wanita", totalVerses: 176 },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", revelationType: "Hidangan", totalVerses: 120 },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", revelationType: "Binatang Ternak", totalVerses: 165 },
  { number: 30, name: "An-Naba'", arabicName: "النبأ", revelationType: "Berita Besar", totalVerses: 40 },
  { number: 108, name: "Al-Kauthar", arabicName: "الكوثر", revelationType: "Nikmat Berlimpah", totalVerses: 3 },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", revelationType: "Ikhlas", totalVerses: 4 },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", revelationType: "Waktu Subuh", totalVerses: 5 },
  { number: 114, name: "An-Nas", arabicName: "الناس", revelationType: "Manusia", totalVerses: 6 },
];

const QORIS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.shaatree', name: 'Abu Bakr Al-Shatri' },
  { id: 'ar.juhany', name: 'Abdullah Al-Juhany' },
  { id: 'ar.husary', name: 'Mahmoud Al-Husary' },
  { id: 'ar.rifai', name: 'Hani Ar-Rifa\'i' },
];

export function SantriDashboard({ user, initialLog }: SantriDashboardProps) {
  const [activeTab, setActiveTab] = useState<SantriTab>('ringkasan');
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  
  // Talaqqi States
  const [selectedQori, setSelectedQori] = useState(QORIS[0]);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [searchSurah, setSearchSurah] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const togglePlay = (surahNumber: number) => {
    if (playingSurah === surahNumber) {
      audioRef.current?.pause();
      setPlayingSurah(null);
    } else {
      setPlayingSurah(surahNumber);
      // Constructing a reliable source for audio
      const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${selectedQori.id}/${surahNumber}.mp3`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((err) => {
          console.error("Gagal memutar audio:", err);
          setPlayingSurah(null);
          toast({
            variant: "destructive",
            title: "Gagal Memutar Audio",
            description: "Maaf, murottal untuk Qori/Surat ini tidak tersedia saat ini.",
          });
        });
      }
    }
  };

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

  const filteredSurahs = SURAHS.filter(s => 
    s.name.toLowerCase().includes(searchSurah.toLowerCase()) || 
    s.number.toString() === searchSurah
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden Audio Element with robust error handling */}
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingSurah(null)} 
        onError={() => {
          setPlayingSurah(null);
          toast({
            variant: "destructive",
            title: "Kesalahan Audio",
            description: "Sumber audio tidak ditemukan. Silakan coba Qori lain.",
          });
        }}
      />

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

          <Card className="glass-card border-dashed border-2 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <Target className="w-12 h-12 mb-4 opacity-20" />
            <p>Belum ada tugas hafalan yang diberikan hari ini.</p>
            <Button variant="link" className="text-primary mt-2">Segarkan Halaman</Button>
          </Card>
        </div>
      ) : activeTab === 'talaqqi' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Talaqqi Header */}
          <div className="bg-[#E9F7F3] dark:bg-primary/10 border border-primary/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Headphones className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-primary-foreground flex items-center gap-2">
                🎧 Mode Talaqqi — Mendengar Qori
              </h2>
            </div>
            <p className="text-sm text-primary/80 mb-6">
              Pilih qori kemudian klik surat untuk mendengarkan. Ulangi hingga hafal, lalu setor ke Ustadz Anda.
            </p>
            
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2">
                {QORIS.map((qori) => (
                  <Button
                    key={qori.id}
                    size="sm"
                    variant={selectedQori.id === qori.id ? "default" : "outline"}
                    className={cn(
                      "rounded-full transition-all text-xs font-medium h-9",
                      selectedQori.id === qori.id ? "bg-primary text-primary-foreground" : "bg-card/50 border-primary/20 text-primary"
                    )}
                    onClick={() => {
                      setSelectedQori(qori);
                      setPlayingSurah(null);
                      audioRef.current?.pause();
                    }}
                  >
                    {qori.name}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Surah List Header & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              Daftar Surat Al-Quran 📖
            </h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari surat..." 
                className="pl-9 glass-card h-10"
                value={searchSurah}
                onChange={(e) => setSearchSurah(e.target.value)}
              />
            </div>
          </div>

          {/* Surah Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah) => (
              <Card key={surah.number} className="glass-card hover:border-primary/50 transition-all group overflow-hidden border-none bg-card/40">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {surah.number}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">{surah.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {surah.revelationType} • {surah.totalVerses} ayat
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-headline font-bold text-primary/80">
                      {surah.arabicName}
                    </div>
                  </div>
                  
                  <Button 
                    className={cn(
                      "w-full font-bold h-11 transition-all",
                      playingSurah === surah.number 
                        ? "bg-accent text-accent-foreground hover:bg-accent/90" 
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    onClick={() => togglePlay(surah.number)}
                  >
                    {playingSurah === surah.number ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Sedang Diputar
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Putar Murottal
                      </>
                    )}
                  </Button>
                </CardContent>
                {playingSurah === surah.number && (
                  <div className="absolute bottom-0 left-0 h-1 bg-accent w-full animate-pulse"></div>
                )}
              </Card>
            ))}
          </div>

          {filteredSurahs.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>Surat "{searchSurah}" tidak ditemukan.</p>
            </div>
          )}
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
