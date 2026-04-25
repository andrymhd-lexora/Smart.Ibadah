"use client"

import { useState, useEffect, useRef } from "react";
import { UserProfile, IbadahLog } from "@/lib/types";
import { 
  getRankByExp, 
  getNextRank, 
  EXP_VALUES,
  PRAYERS_WAJIB,
  PRAYERS_SUNNAH,
  DAILY_IBADAH
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
  Search,
  Mic,
  Square,
  Trash2,
  Send,
  LayoutGrid,
  List,
  Copy,
  Info,
  Volume2,
  History
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HADITS_LIST, DOA_LIST, Hadits, Doa } from "@/lib/hadits-doa-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", revelationType: "Mekah", totalVerses: 7 },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", revelationType: "Madinah", totalVerses: 286 },
  { number: 3, name: "Ali 'Imran", arabicName: "آl عمران", revelationType: "Madinah", totalVerses: 200 },
  { number: 4, name: "An-Nisa'", arabicName: "النساء", revelationType: "Madinah", totalVerses: 176 },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", revelationType: "Madinah", totalVerses: 120 },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", revelationType: "Mekah", totalVerses: 165 },
  { number: 78, name: "An-Naba'", arabicName: "النبأ", revelationType: "Mekah", totalVerses: 40 },
  { number: 108, name: "Al-Kauthar", arabicName: "الكوثر", revelationType: "Mekah", totalVerses: 3 },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", revelationType: "Mekah", totalVerses: 4 },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", revelationType: "Mekah", totalVerses: 5 },
  { number: 114, name: "An-Nas", arabicName: "الناس", revelationType: "Mekah", totalVerses: 6 },
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
  
  // Talaqqi & Tahfidz States
  const [selectedQori, setSelectedQori] = useState(QORIS[0]);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Integration Stats
  const [murottalMinutes, setMurottalMinutes] = useState(0);
  const [lastSurahPlayed, setLastSurahPlayed] = useState<string | null>(null);
  const [tahfidzSubmissions, setTahfidzSubmissions] = useState<string[]>([]);
  const murottalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mutabaah Checkbox States
  const [completedPrayers, setCompletedPrayers] = useState<string[]>(['Subuh', 'Dzuhur']);
  const [completedSunnah, setCompletedSunnah] = useState<string[]>(['Sedekah', 'Dzikir Pagi & Petang']);
  
  // Tahfidz & Doa Recording States
  const [tahfidzViewMode, setTahfidzViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItemForSetoran, setSelectedItemForSetoran] = useState<{name: string, type: 'surah' | 'doa'} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Audio Tracking Logic
  useEffect(() => {
    if (playingSurah) {
      murottalTimerRef.current = setInterval(() => {
        setMurottalMinutes(prev => prev + 1);
      }, 60000); // Increment every minute
    } else {
      if (murottalTimerRef.current) clearInterval(murottalTimerRef.current);
    }
    return () => {
      if (murottalTimerRef.current) clearInterval(murottalTimerRef.current);
    };
  }, [playingSurah]);

  const togglePlay = (surahNumber: number) => {
    const surah = SURAHS.find(s => s.number === surahNumber);
    if (playingSurah === surahNumber) {
      audioRef.current?.pause();
      setPlayingSurah(null);
    } else {
      setPlayingSurah(surahNumber);
      setLastSurahPlayed(surah?.name || null);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Gagal mengakses mikrofone:", err);
      toast({
        variant: "destructive",
        title: "Gagal Mengakses Mikrofon",
        description: "Pastikan Anda memberikan izin akses mikrofon di browser.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const sendRecording = () => {
    if (selectedItemForSetoran) {
      setTahfidzSubmissions(prev => [...prev, selectedItemForSetoran.name]);
    }
    toast({
      title: "Setoran Dikirim!",
      description: `Rekaman ${selectedItemForSetoran?.name} berhasil dikirim ke Ustadz.`,
    });
    setSelectedItemForSetoran(null);
    deleteRecording();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Berhasil Disalin",
      description: "Teks telah disalin ke papan klip.",
    });
  };

  const togglePrayer = (prayer: string) => {
    setCompletedPrayers(prev => 
      prev.includes(prayer) ? prev.filter(p => p !== prayer) : [...prev, prayer]
    );
  };

  const toggleSunnah = (activity: string) => {
    setCompletedSunnah(prev => 
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    );
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
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.number.toString() === searchQuery
  );

  const filteredHadits = HADITS_LIST.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.translation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDoa = DOA_LIST.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12">
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingSurah(null)} 
        onError={() => {
          setPlayingSurah(null);
        }}
      />

      {/* Sub-Navigation Bar */}
      <Card className="glass-card border-none bg-card/40 overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex p-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as SantriTab);
                  setSearchQuery("");
                }}
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

      {/* Tab Contents */}
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
            <Card className="glass-card bg-primary/5 border-primary/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                  <Target className="w-4 h-4" /> Tugas Menunggu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <Button variant="link" className="p-0 text-xs h-auto mt-2 text-primary" onClick={() => setActiveTab('tugas-guru')}>Lihat Daftar Tugas <ArrowRight className="w-3 h-3 ml-1"/></Button>
              </CardContent>
            </Card>
            <Card className="glass-card bg-accent/5 border-accent/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-accent">
                  <Clock className="w-4 h-4" /> Kehadiran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">98%</div>
                <p className="text-[10px] text-muted-foreground mt-2">Bulan Ini (Januari)</p>
              </CardContent>
            </Card>
            <Card className="glass-card bg-emerald-500/5 border-emerald-500/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-500">
                  <BookOpen className="w-4 h-4" /> Capaian Tahfidz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">Juz 30</div>
                <Button variant="link" className="p-0 text-xs h-auto mt-2 text-emerald-500" onClick={() => setActiveTab('tahfidz')}>Lihat Progress <ArrowRight className="w-3 h-3 ml-1"/></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : activeTab === 'mutabaah' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Sholat Wajib */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Sholat Wajib</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PRAYERS_WAJIB.map((prayer) => (
                <button
                  key={prayer}
                  onClick={() => togglePrayer(prayer)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border transition-all h-24",
                    completedPrayers.includes(prayer)
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-secondary/40 border-white/5 text-muted-foreground hover:bg-secondary/60"
                  )}
                >
                  <span className="font-bold text-sm mb-1">{prayer}</span>
                  <span className={cn(
                    "text-[10px] font-bold",
                    completedPrayers.includes(prayer) ? "text-primary" : "text-muted-foreground opacity-50"
                  )}>+50 EXP</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sunnah & Lainnya */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Sunnah & Lainnya</h3>
              <Card className="glass-card bg-card/40 border-none">
                <CardContent className="p-4 space-y-3">
                  {[...PRAYERS_SUNNAH, ...DAILY_IBADAH, 'Dzikir Pagi & Petang'].map((item) => (
                    <div 
                      key={item} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                        completedSunnah.includes(item) ? "bg-primary/5 border-primary/20" : "bg-transparent border-white/5"
                      )}
                      onClick={() => toggleSunnah(item)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                          completedSunnah.includes(item) ? "bg-primary border-primary" : "border-white/20"
                        )}>
                          {completedSunnah.includes(item) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={cn("text-sm font-medium", completedSunnah.includes(item) ? "text-foreground" : "text-muted-foreground")}>{item}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] opacity-70">
                        +{item === 'Dzikir Pagi & Petang' ? 20 : item === 'Sedekah' || item === 'Puasa' ? 40 : 30} EXP
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Audio & Fokus + Ringkasan Tilawah */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Audio & Fokus</h3>
              <Card className="glass-card border-accent/20 bg-accent/5">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/20 p-3 rounded-xl">
                      <Volume2 className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold">Waktu Murottal</h4>
                      <p className="text-xs text-muted-foreground">Menit mendengarkan hari ini</p>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 right-4 flex items-center text-xs text-muted-foreground font-bold pointer-events-none">menit</div>
                    <div className="w-full bg-secondary/50 rounded-xl p-4 border border-white/10 text-3xl font-mono font-bold">
                      {murottalMinutes > 0 ? murottalMinutes : "0"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                    <History className="w-3 h-3" />
                    {lastSurahPlayed ? `Sedang/Terakhir mendengar: Surat ${lastSurahPlayed}` : "Belum ada murottal yang diputar hari ini"}
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground/60 leading-relaxed pt-2">
                    *Tips: Mendengarkan Murottal membantu hafalan dan fokusmu.*
                  </p>
                </CardContent>
              </Card>

              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Ringkasan Tilawah</h3>
              <Card className="glass-card border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> Progress Setoran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tahfidzSubmissions.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Setoran Hari Ini:</p>
                      <div className="flex flex-wrap gap-2">
                        {tahfidzSubmissions.map((s, i) => (
                          <Badge key={i} className="bg-primary text-primary-foreground font-bold px-3 py-1">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-4 text-[10px] text-primary font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Tugas Terkirim
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto opacity-50">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground italic">Belum ada setoran hari ini</p>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-widest" onClick={() => setActiveTab('tahfidz')}>Ke Tab Tahfidz</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : activeTab === 'hadits' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-primary" />
              30 Hadits Pilihan 📜
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari judul atau isi hadits..." 
                className="pl-9 glass-card h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHadits.map((hadits) => (
              <Card key={hadits.id} className="glass-card border-none bg-card/40 flex flex-col overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      Hadits {hadits.id}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-bold">{hadits.source}</span>
                  </div>
                  <CardTitle className="text-lg mt-2">{hadits.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 relative group">
                    <p className="text-2xl text-right font-headline leading-relaxed text-primary">
                      {hadits.arabic}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(hadits.arabic)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{hadits.translation}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : activeTab === 'doa' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <HandHeart className="w-6 h-6 text-accent" />
              30 Doa & Dzikir Harian 🙏
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari doa harian atau dzikir sholat..." 
                className="pl-9 glass-card h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoa.map((doa) => (
              <Card key={doa.id} className="glass-card border-none bg-card/40 flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                        {doa.id}
                      </div>
                      {doa.title}
                    </CardTitle>
                    <Badge className={cn(
                      "text-[10px] font-bold uppercase",
                      doa.category === 'Sholat' ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                    )}>
                      {doa.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-3xl text-right font-headline leading-loose text-foreground">
                    {doa.arabic}
                  </p>
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-xs font-bold text-accent italic tracking-wide">
                      {doa.latin}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {doa.translation}
                    </p>
                  </div>

                  {/* Task Actions for Doa */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Info className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Selesaikan Tugas</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 border-primary/20 hover:bg-primary/10 text-primary font-bold text-[10px] uppercase gap-1"
                        onClick={() => setSelectedItemForSetoran({ name: doa.title, type: 'doa' })}
                      >
                        <Mic className="w-3 h-3" />
                        Rekam
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 border-accent/20 hover:bg-accent/10 text-accent font-bold text-[10px] uppercase gap-1"
                      >
                        <Play className="w-3 h-3" />
                        Play
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 border-white/10 hover:bg-white/5 text-foreground font-bold text-[10px] uppercase gap-1"
                        onClick={() => toast({ title: "Kirim Tugas", description: `Menyiapkan setoran ${doa.title}...` })}
                      >
                        <Send className="w-3 h-3" />
                        Kirim
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : activeTab === 'tahfidz' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Pilih Materi Tahfidz 📖
            </h2>
            <div className="flex bg-secondary/30 rounded-lg p-1">
              <Button 
                variant={tahfidzViewMode === 'grid' ? "secondary" : "ghost"} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setTahfidzViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={tahfidzViewMode === 'list' ? "secondary" : "ghost"} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setTahfidzViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari surat untuk setoran..." 
              className="pl-9 glass-card h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {tahfidzViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurahs.map((surah) => (
                <Card key={surah.number} className="glass-card hover:border-primary/50 transition-all border-none bg-card/40">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {surah.number}
                      </div>
                      <div className="text-3xl font-bold text-foreground font-headline">
                        {surah.arabicName}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-6">{surah.name}</h3>
                    <Button 
                      className="w-full bg-white text-primary border border-primary/20 hover:bg-primary/10 rounded-xl py-6 font-bold flex items-center gap-2"
                      onClick={() => setSelectedItemForSetoran({ name: surah.name, type: 'surah' })}
                    >
                      <Mic className="w-5 h-5" />
                      Setor Hafalan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSurahs.map((surah) => (
                <Card key={surah.number} className="glass-card hover:border-primary/50 transition-all border-none bg-card/40">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {surah.number}
                      </div>
                      <div>
                        <h4 className="font-bold">{surah.name}</h4>
                        <p className="text-xs text-muted-foreground">{surah.revelationType} • {surah.totalVerses} Ayat</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-foreground hidden sm:block">
                        {surah.arabicName}
                      </div>
                      <Button 
                        variant="outline"
                        className="border-primary/20 text-primary hover:bg-primary/10"
                        onClick={() => setSelectedItemForSetoran({ name: surah.name, type: 'surah' })}
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Setor
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'talaqqi' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              Daftar Surat Al-Quran 📖
            </h3>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Cari surat..." 
                className="pl-9 glass-card h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

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
        </div>
      ) : (
        <Card className="glass-card p-12 text-center animate-in fade-in duration-300">
          <p className="text-muted-foreground">Halaman {activeTab} sedang dalam pengembangan.</p>
          <Button variant="outline" className="mt-4" onClick={() => setActiveTab('ringkasan')}>
            Kembali ke Ringkasan
          </Button>
        </Card>
      )}

      {/* Recording Dialog */}
      <Dialog open={!!selectedItemForSetoran} onOpenChange={() => {
        if (!isRecording) setSelectedItemForSetoran(null);
      }}>
        <DialogContent className="glass-card sm:max-w-md border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              Setoran: {selectedItemForSetoran?.name}
            </DialogTitle>
            <DialogDescription>
              Rekam bacaan Anda dengan jelas kemudian kirimkan ke Ustadz.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300",
              isRecording ? "bg-red-500 animate-pulse scale-110" : "bg-primary/20"
            )}>
              {isRecording ? (
                <Square className="w-8 h-8 text-white fill-current" />
              ) : (
                <Mic className="w-10 h-10 text-primary" />
              )}
            </div>

            <div className="text-3xl font-mono font-bold">
              {formatTime(recordingTime)}
            </div>

            {audioUrl && !isRecording && (
              <div className="w-full space-y-2">
                <p className="text-xs text-center text-muted-foreground font-bold uppercase tracking-widest">Pratinjau Rekaman</p>
                <audio src={audioUrl} controls className="w-full" />
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-center">
            {!audioUrl ? (
              <Button 
                className={cn(
                  "flex-1 font-bold h-12",
                  isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary"
                )}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? "Selesai Rekam" : "Mulai Rekam"}
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/10 h-12"
                  onClick={deleteRecording}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
                <Button 
                  className="flex-1 bg-primary font-bold h-12"
                  onClick={sendRecording}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Suara
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="text-center pt-8">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50">
          Dikembangkan untuk Rumah Tahfidz Ikhsan
        </p>
      </footer>
    </div>
  );
}
