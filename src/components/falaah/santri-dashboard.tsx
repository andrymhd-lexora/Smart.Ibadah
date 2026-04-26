
"use client"

import { useState, useEffect, useRef } from "react";
import { UserProfile, HafalanSubmission } from "@/lib/types";
import { 
  getRankByExp, 
  getNextRank, 
  RANKS,
  PRAYERS_WAJIB,
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
  ChevronRight,
  Flame,
  Star,
  Play,
  Pause,
  Mic,
  Square,
  LayoutGrid,
  List,
  AlertCircle,
  Calendar as CalendarIcon,
  Zap,
  Shield,
  Medal,
  Sparkles,
  Volume2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { getPersonalizedMotivation } from "@/ai/flows/personalized-motivation-ai";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HADITS_LIST, DOA_LIST } from "@/lib/hadits-doa-data";
import { ALL_SURAHS } from "@/lib/quran-data";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query } from "firebase/firestore";

interface SantriDashboardProps {
  user: UserProfile;
}

type SantriTab = 'ringkasan' | 'tugas-guru' | 'talaqqi' | 'tahfidz' | 'hadits' | 'doa' | 'mutabaah' | 'rank';

const QORIS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.shaatree', name: 'Abu Bakr Al-Shatri' },
  { id: 'ar.juhany', name: 'Abdullah Al-Juhany' },
];

export function SantriDashboard({ user }: SantriDashboardProps) {
  const [activeTab, setActiveTab] = useState<SantriTab>('ringkasan');
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const db = useFirestore();

  const [selectedQori, setSelectedQori] = useState(QORIS[0]);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');

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

  // Real-time submissions for display
  const submissionsQuery = useMemoFirebase(() => {
    if (!db || !user.uid) return null;
    return query(collection(db, `users/${user.uid}/ibadahLogs/${dateString}/hafalanSubmissions`));
  }, [db, user.uid, dateString]);

  const { data: todaySubmissions } = useCollection<HafalanSubmission>(submissionsQuery);

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
    if (activeTab === 'ringkasan' && !motivation) fetchMotivation();
  }, [user.totalExp, expNeeded, nextRank?.name, user.name, activeTab, motivation]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioUrl(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      toast({ variant: "destructive", title: "Gagal", description: "Izin mikrofon ditolak." });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const sendRecording = () => {
    if (!selectedItemForSetoran || !db || !user.uid) return;

    const submissionData = {
      santriId: user.uid,
      santriName: user.name,
      ibadahLogId: dateString,
      submissionDate: new Date().toISOString(),
      hafalanContent: `Setoran ${selectedItemForSetoran.name}`,
      status: 'PENDING_REVIEW',
      expAwarded: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedUstadzId: 'MOCK_USTADZ_ID'
    };

    const submissionRef = collection(db, `users/${user.uid}/ibadahLogs/${dateString}/hafalanSubmissions`);
    addDocumentNonBlocking(submissionRef, submissionData);

    toast({ title: "Setoran Dikirim!", description: `Rekaman ${selectedItemForSetoran?.name} berhasil dikirim ke Ustadz.` });
    setSelectedItemForSetoran(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const togglePlay = (surahNumber: number) => {
    const surah = ALL_SURAHS.find(s => s.number === surahNumber);
    if (playingSurah === surahNumber) {
      audioRef.current?.pause();
      setPlayingSurah(null);
    } else {
      setPlayingSurah(surahNumber);
      const url = `https://cdn.islamic.network/quran/audio-surah/128/${selectedQori.id}/${surahNumber}.mp3`;
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {
          setPlayingSurah(null);
          toast({ variant: "destructive", title: "Gagal", description: "Audio tidak tersedia." });
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

  return (
    <div className="space-y-6 pb-20">
      <audio ref={audioRef} onEnded={() => setPlayingSurah(null)} />

      {/* Navigation Tabs */}
      <Card className="glass-card border-none bg-card/40 overflow-hidden sticky top-20 z-40">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex p-2 gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SantriTab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground shadow-lg scale-105" 
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

      {/* Content Area */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="glass-card overflow-hidden border-none relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-destructive"></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <span className="text-3xl">{currentRank.icon}</span>
                    {currentRank.name}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {user.totalExp.toLocaleString()} Total EXP
                  </CardDescription>
                </div>
                <Badge className="bg-orange-500/10 text-orange-500 border-none">
                  <Flame className="w-3 h-3 mr-1 fill-current" />
                  {user.streak} Hari Streak
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span>Progress Level</span>
                  <span>{Math.round(expProgress)}%</span>
                </div>
                <Progress value={expProgress} className="h-3 bg-secondary" />
              </div>
              
              <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4 items-start relative group">
                <div className="bg-primary/20 p-3 rounded-xl"><BrainCircuit className="w-6 h-6 text-primary" /></div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm mb-1 text-primary">Nasihat Ustadz AI</h4>
                  <p className="text-sm italic leading-relaxed text-foreground/80">
                    {loadingMotivation ? "Sedang merangkai kata hikmah..." : motivation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card border-none bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-accent" /> Target Hari Ini</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Sholat 5 Waktu', 'Tilawah 1 Juz', 'Setoran Hafalan Baru'].map((target, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-sm font-medium">{target}</span>
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card border-none bg-card/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Bonus Mingguan</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6">
                <Medal className="w-12 h-12 text-yellow-500 mb-2 opacity-30" />
                <p className="text-xs text-muted-foreground text-center">Selesaikan target 7 hari berturut-turut untuk bonus 500 EXP!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'tahfidz' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-card p-3 rounded-xl shadow-sm"><BookOpen className="w-8 h-8 text-primary" /></div>
              <div>
                <h2 className="text-xl font-bold">Kirim Hafalan</h2>
                <p className="text-sm text-muted-foreground">Pilih surat dan rekam setoranmu.</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_SURAHS.slice(0, 37).reverse().map((surah) => {
              const sub = todaySubmissions?.find(s => s.hafalanContent.includes(surah.name));
              return (
                <Card key={surah.number} className={cn("glass-card border-none bg-card/40 transition-all flex flex-col", sub && "ring-1 ring-emerald-500/50")}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="text-[10px]">Ayat 1-{surah.totalVerses}</Badge>
                      <span className="text-2xl font-headline text-primary">{surah.arabicName}</span>
                    </div>
                    <CardTitle className="text-lg">{surah.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 flex gap-2">
                    <Button 
                      className="flex-1 bg-primary text-primary-foreground font-bold text-xs h-9 rounded-full"
                      onClick={() => setSelectedItemForSetoran({ name: surah.name, type: 'surah' })}
                    >
                      <Mic className="w-3 h-3 mr-2" />
                      Setor
                    </Button>
                    {sub?.status === 'VERIFIED' && <Badge className="bg-emerald-500"><CheckCircle2 className="w-3 h-3" /></Badge>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'talaqqi' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <Card className="glass-card border-none bg-card/40 p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 space-y-4">
                <h3 className="font-bold flex items-center gap-2"><Volume2 className="w-4 h-4" /> Pilih Qori</h3>
                {QORIS.map(q => (
                  <button 
                    key={q.id}
                    onClick={() => setSelectedQori(q)}
                    className={cn(
                      "w-full p-3 rounded-xl text-left text-sm transition-all border",
                      selectedQori.id === q.id ? "bg-primary/20 border-primary text-primary" : "bg-white/5 border-transparent text-muted-foreground"
                    )}
                  >
                    {q.name}
                  </button>
                ))}
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="font-bold">Putar Murottal</h3>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {ALL_SURAHS.map(s => (
                      <div key={s.number} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-6">{s.number}</span>
                          <div>
                            <p className="text-sm font-medium">{s.name}</p>
                            <p className="text-[10px] text-muted-foreground">{s.arabicName}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => togglePlay(s.number)}>
                          {playingSurah === s.number ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'hadits' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HADITS_LIST.map(h => (
              <Card key={h.id} className="glass-card border-none bg-card/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-primary">
                    <ScrollText className="w-4 h-4" />
                    {h.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xl font-headline text-right leading-loose">{h.arabic}</p>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-sm italic">"{h.translation}"</p>
                    <p className="text-[10px] mt-2 text-muted-foreground text-right">{h.source}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'doa' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOA_LIST.map(d => (
              <Card key={d.id} className="glass-card border-none bg-card/40">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-accent">
                    <HandHeart className="w-4 h-4" />
                    {d.title}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit">{d.category}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xl font-headline text-right leading-loose">{d.arabic}</p>
                  <p className="text-xs text-muted-foreground italic">{d.latin}</p>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-sm">"{d.translation}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mutabaah' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-secondary/30 p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold">Laporan Harian</h3>
                <p className="text-sm text-muted-foreground">Catat ibadah harianmu.</p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="glass-card font-bold">
                  {format(selectedDate, "d MMMM yyyy", { locale: id })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} /></PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card border-none bg-card/40">
              <CardHeader><CardTitle className="text-sm">Sholat Wajib</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {PRAYERS_WAJIB.map(p => (
                  <div key={p} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <span className="text-sm">{p}</span>
                    <div className="w-5 h-5 rounded-full border-2 border-primary"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="glass-card border-none bg-card/40">
              <CardHeader><CardTitle className="text-sm">Ibadah Lainnya</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {DAILY_IBADAH.map(i => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                    <span className="text-sm">{i}</span>
                    <div className="w-5 h-5 rounded-full border-2 border-accent"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Button className="w-full h-12 bg-primary font-bold">Simpan Mutaba'ah Hari Ini</Button>
        </div>
      )}

      {activeTab === 'rank' && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
          {/* Superhero Section */}
          <div className="relative py-20 overflow-hidden rounded-[3rem] bg-[#0f172a] border-4 border-primary/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)] animate-pulse"></div>
            <div className="relative flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/30 blur-[40px] rounded-full animate-bounce duration-1000"></div>
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-emerald-600 border-4 border-white flex items-center justify-center text-7xl shadow-2xl">
                  {currentRank.icon}
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-headline font-black tracking-tighter text-white drop-shadow-lg">
                  PAHLAWAN <span className="text-primary italic">AL-QURAN</span>
                </h2>
                <Badge className="bg-white text-black font-black px-4 py-1 text-lg rounded-full">LEVEL {currentRank.name}</Badge>
              </div>
              <div className="w-full max-w-md px-8 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-black uppercase text-white/50 tracking-widest">Power Level</span>
                  <span className="text-xs font-black text-primary">{user.totalExp} / {nextRank?.minExp || 'MAX'}</span>
                </div>
                <div className="relative h-6 rounded-full bg-black/50 border-2 border-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary transition-all duration-1000 relative"
                    style={{ width: `${expProgress}%` }}
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hall of Fame */}
          <div className="space-y-6">
            <h3 className="text-2xl font-headline font-bold text-center">Hall of <span className="text-primary">Spiritual Fame</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {RANKS.map((r, i) => {
                const isReached = user.totalExp >= r.minExp;
                return (
                  <div key={i} className={cn(
                    "relative p-4 rounded-2xl text-center border-2 transition-all",
                    isReached ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-white/5 border-white/5 opacity-40"
                  )}>
                    <div className="text-3xl mb-2">{r.icon}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest">{r.name}</div>
                    {!isReached && <Shield className="w-4 h-4 absolute top-2 right-2 text-white/20" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Sakti Berdoa', desc: 'Selesaikan 30 doa harian.', icon: <Zap className="text-yellow-500" /> },
              { title: 'Pakar Hadits', desc: 'Hafalkan 10 hadits pilihan.', icon: <Shield className="text-blue-500" /> },
              { title: 'Pelindung Masjid', desc: '5 hari berjamaah di masjid.', icon: <Sparkles className="text-purple-500" /> }
            ].map((ach, i) => (
              <Card key={i} className="glass-card border-none bg-card/40 overflow-hidden group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase">{ach.title}</h4>
                    <p className="text-xs text-muted-foreground">{ach.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recording Dialog */}
      <Dialog open={!!selectedItemForSetoran} onOpenChange={() => !isRecording && setSelectedItemForSetoran(null)}>
        <DialogContent className="glass-card sm:max-w-md border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mic className="w-5 h-5 text-primary" />Setoran: {selectedItemForSetoran?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center shadow-2xl", isRecording ? "bg-red-500 animate-pulse" : "bg-primary/20")}>
              {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-10 h-10 text-primary" />}
            </div>
            <div className="text-3xl font-mono font-bold">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</div>
            {audioUrl && !isRecording && <audio src={audioUrl} controls className="w-full" />}
          </div>
          <DialogFooter className="flex-row gap-2">
            {!audioUrl ? (
              <Button className={cn("flex-1 h-12 font-bold", isRecording ? "bg-red-500" : "bg-primary")} onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "Berhenti" : "Mulai Rekam"}
              </Button>
            ) : (
              <><Button variant="outline" className="flex-1 h-12 font-bold" onClick={() => setAudioUrl(null)}>Ulangi</Button><Button className="flex-1 h-12 font-bold" onClick={sendRecording}>Kirim Sekarang</Button></>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
