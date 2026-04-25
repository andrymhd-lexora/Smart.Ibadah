
"use client"

import { useState, useEffect, useRef, useMemo } from "react";
import { UserProfile, IbadahLog } from "@/lib/types";
import { 
  getRankByExp, 
  getNextRank, 
  EXP_VALUES,
  PRAYERS_WAJIB,
  PRAYERS_SUNNAH,
  DAILY_IBADAH,
  RANKS
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
  History,
  AlertCircle,
  Calendar as CalendarIcon,
  XCircle,
  Hourglass,
  PartyPopper,
  Zap,
  Shield,
  Medal,
  Crown,
  Sword,
  Sparkles
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
import { HADITS_LIST, DOA_LIST } from "@/lib/hadits-doa-data";
import { ALL_SURAHS } from "@/lib/quran-data";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isBefore } from "date-fns";
import { id } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface SantriDashboardProps {
  user: UserProfile;
  initialLog: IbadahLog;
}

type SantriTab = 'ringkasan' | 'tugas-guru' | 'talaqqi' | 'tahfidz' | 'hadits' | 'doa' | 'mutabaah' | 'rank';
type TaskStatus = 'Semua' | 'Belum Setor' | 'Menunggu Nilai' | 'Sudah Dinilai';

interface TeacherTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  deadline?: string;
}

const QORIS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.shaatree', name: 'Abu Bakr Al-Shatri' },
  { id: 'ar.juhany', name: 'Abdullah Al-Juhany' },
  { id: 'ar.husary', name: 'Mahmoud Al-Husary' },
  { id: 'ar.rifai', name: 'Hani Ar-Rifa\'i' },
];

const MOCK_ATTENDANCE = [
  { date: new Date(2025, 2, 1), hasReport: true },
  { date: new Date(2025, 2, 2), hasReport: true },
  { date: new Date(2025, 2, 3), hasReport: false },
  { date: new Date(2025, 2, 4), hasReport: true },
  { date: new Date(2025, 2, 5), hasReport: false },
];

const MOCK_TASKS: TeacherTask[] = [];

export function SantriDashboard({ user, initialLog }: SantriDashboardProps) {
  const [activeTab, setActiveTab] = useState<SantriTab>('ringkasan');
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  
  const [selectedQori, setSelectedQori] = useState(QORIS[0]);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [murottalMinutes, setMurottalMinutes] = useState(0);
  const [lastSurahPlayed, setLastSurahPlayed] = useState<string | null>(null);
  const [tahfidzSubmissions, setTahfidzSubmissions] = useState<string[]>([]);
  const murottalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completedPrayers, setCompletedPrayers] = useState<string[]>(['Subuh', 'Dzuhur']);
  const [completedSunnah, setCompletedSunnah] = useState<string[]>(['Sedekah', 'Dzikir Pagi & Petang']);
  
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const [tahfidzViewMode, setTahfidzViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItemForSetoran, setSelectedItemForSetoran] = useState<{name: string, type: 'surah' | 'doa'} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [taskFilter, setTaskFilter] = useState<TaskStatus>('Semua');

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

  useEffect(() => {
    if (playingSurah) {
      murottalTimerRef.current = setInterval(() => {
        setMurottalMinutes(prev => prev + 1);
      }, 60000);
    } else {
      if (murottalTimerRef.current) clearInterval(murottalTimerRef.current);
    }
    return () => {
      if (murottalTimerRef.current) clearInterval(murottalTimerRef.current);
    };
  }, [playingSurah]);

  const togglePlay = (surahNumber: number) => {
    const surah = ALL_SURAHS.find(s => s.number === surahNumber);
    if (playingSurah === surahNumber) {
      audioRef.current?.pause();
      setPlayingSurah(null);
    } else {
      setPlayingSurah(surahNumber);
      setLastSurahPlayed(surah?.name || null);
      const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${selectedQori.id}/${surahNumber}.mp3`;
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(() => {
          setPlayingSurah(null);
          toast({
            variant: "destructive",
            title: "Gagal Memutar Audio",
            description: "Maaf, murottal tidak tersedia.",
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
    if (selectedItemForSetoran) setTahfidzSubmissions(prev => [...prev, selectedItemForSetoran.name]);
    toast({ title: "Setoran Dikirim!", description: `Rekaman ${selectedItemForSetoran?.name} berhasil dikirim.` });
    setSelectedItemForSetoran(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const togglePrayer = (prayer: string) => {
    setCompletedPrayers(prev => prev.includes(prayer) ? prev.filter(p => p !== prayer) : [...prev, prayer]);
  };

  const toggleSunnah = (activity: string) => {
    setCompletedSunnah(prev => prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]);
  };

  const attendanceDays = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return eachDayOfInterval({ start, end });
  }, []);

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

  const filteredTasks = MOCK_TASKS.filter(task => {
    if (taskFilter === 'Semua') return true;
    return task.status === taskFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      <audio ref={audioRef} onEnded={() => setPlayingSurah(null)} />

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
                  <CardDescription className="text-muted-foreground">
                    {user.totalExp.toLocaleString()} Total EXP
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge className="bg-orange-500/10 text-orange-500 border-none mb-1">
                    <Flame className="w-3 h-3 mr-1 fill-current" />
                    {user.streak} Hari Streak
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={expProgress} className="h-3 bg-secondary" />
              <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-start cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setActiveTab('tugas-guru')}>
                <div className="bg-primary/20 p-2 rounded-lg"><BrainCircuit className="w-5 h-5 text-primary" /></div>
                <div className="flex-1"><p className="text-sm italic text-foreground/90">{loadingMotivation ? "Menghubungi Ustadz AI..." : motivation}</p></div>
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
                <Button variant="link" className="p-0 text-xs text-primary" onClick={() => setActiveTab('tugas-guru')}>Lihat Tugas <ArrowRight className="w-3 h-3 ml-1"/></Button>
              </CardContent>
            </Card>
            <Card 
              className="glass-card bg-accent/5 border-accent/10 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => setIsAttendanceModalOpen(true)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-accent">
                  <Clock className="w-4 h-4" /> Kehadiran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">98%</div>
                <p className="text-[10px] text-muted-foreground mt-2">Klik untuk detail progres</p>
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
                <Button variant="link" className="p-0 text-xs text-emerald-500" onClick={() => setActiveTab('tahfidz')}>Lihat Progress <ArrowRight className="w-3 h-3 ml-1"/></Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : activeTab === 'tugas-guru' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl p-8 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white dark:bg-card p-2 rounded-xl shadow-sm border border-emerald-100 dark:border-white/5">
                <Target className="w-6 h-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Tugas Hafalan dari Guru</h2>
            </div>
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              Setor hafalan untuk setiap target yang diberikan gurumu.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={taskFilter === 'Semua' ? 'default' : 'outline'}
              className={cn("rounded-full px-6 h-11 font-bold", taskFilter === 'Semua' && "bg-emerald-600 hover:bg-emerald-700")}
              onClick={() => setTaskFilter('Semua')}
            >
              Semua ({MOCK_TASKS.length})
            </Button>
            <Button
              variant={taskFilter === 'Belum Setor' ? 'default' : 'outline'}
              className={cn("rounded-full px-6 h-11 font-bold gap-2", taskFilter === 'Belum Setor' && "bg-emerald-600 hover:bg-emerald-700")}
              onClick={() => setTaskFilter('Belum Setor')}
            >
              <Hourglass className="w-4 h-4" />
              Belum Setor
            </Button>
            <Button
              variant={taskFilter === 'Menunggu Nilai' ? 'default' : 'outline'}
              className={cn("rounded-full px-6 h-11 font-bold gap-2", taskFilter === 'Menunggu Nilai' && "bg-emerald-600 hover:bg-emerald-700")}
              onClick={() => setTaskFilter('Menunggu Nilai')}
            >
              <History className="w-4 h-4" />
              Menunggu Nilai
            </Button>
            <Button
              variant={taskFilter === 'Sudah Dinilai' ? 'default' : 'outline'}
              className={cn("rounded-full px-6 h-11 font-bold gap-2", taskFilter === 'Sudah Dinilai' && "bg-emerald-600 hover:bg-emerald-700")}
              onClick={() => setTaskFilter('Sudah Dinilai')}
            >
              <CheckCircle2 className="w-4 h-4" />
              Sudah Dinilai
            </Button>
          </div>

          <div className="bg-secondary/20 rounded-[2.5rem] p-24 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-white/10">
            <div className="relative">
              <PartyPopper className="w-16 h-16 text-primary/60" />
              <div className="absolute -top-1 -right-1">
                <Star className="w-6 h-6 text-accent fill-accent animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground/80">Tidak ada tugas di kategori ini</h3>
          </div>
        </div>
      ) : activeTab === 'talaqqi' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-card p-3 rounded-xl shadow-sm"><Headphones className="w-8 h-8 text-primary" /></div>
              <div><h2 className="text-xl font-bold">Mode Talaqqi</h2><p className="text-sm text-muted-foreground">Dengarkan dan ikuti bacaan Qori untuk memperlancar hafalan.</p></div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Qori:</span>
              <ScrollArea className="w-48 whitespace-nowrap"><div className="flex gap-2 pb-2">
                {QORIS.map(q => <Button key={q.id} variant={selectedQori.id === q.id ? "default" : "outline"} size="sm" className="rounded-full text-[10px] h-8" onClick={() => setSelectedQori(q)}>{q.name}</Button>)}
              </div><ScrollBar orientation="horizontal" /></ScrollArea>
            </div>
          </div>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Cari nama surat..." className="pl-9 glass-card h-12" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_SURAHS.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((surah) => (
              <Card key={surah.number} className={cn("glass-card border-none bg-card/40 hover:bg-card/60 transition-all group overflow-hidden", playingSurah === surah.number && "ring-2 ring-primary bg-primary/5 shadow-xl")}>
                <div className="p-4 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center font-bold text-xs">{surah.number}</div>
                    <div><h3 className="font-bold text-lg">{surah.name}</h3><p className="text-[10px] text-muted-foreground uppercase">{surah.revelationType} • {surah.totalVerses} Ayat</p></div>
                  </div>
                  <div className="text-2xl font-headline text-primary/80">{surah.arabicName}</div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <Button className={cn("flex-1 font-bold text-xs h-9 rounded-full transition-all", playingSurah === surah.number ? "bg-destructive text-white" : "bg-primary text-primary-foreground")} onClick={() => togglePlay(surah.number)}>
                    {playingSurah === surah.number ? <><Pause className="w-3 h-3 mr-2" />Berhenti</> : <><Play className="w-3 h-3 mr-2" />Putar Murottal</>}
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-primary/20 hover:bg-primary/10 transition-colors" onClick={() => { setActiveTab('tahfidz'); toast({ title: "Siap Setoran", description: `Mulai hafalkan surat ${surah.name}` }); }}><Target className="w-4 h-4 text-primary" /></Button>
                </div>
                {playingSurah === surah.number && <div className="absolute bottom-0 left-0 h-1 bg-primary animate-progress-glow w-full origin-left"></div>}
              </Card>
            ))}
          </div>
        </div>
      ) : activeTab === 'tahfidz' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-card p-3 rounded-xl shadow-sm"><BookOpen className="w-8 h-8 text-primary" /></div>
              <div><h2 className="text-xl font-bold">Target Tahfidz</h2><p className="text-sm text-muted-foreground">Kirim setoran hafalan baru atau muroja'ah.</p></div>
            </div>
            <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-lg">
              <Button variant={tahfidzViewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="w-8 h-8" onClick={() => setTahfidzViewMode('grid')}><LayoutGrid className="w-4 h-4" /></Button>
              <Button variant={tahfidzViewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="w-8 h-8" onClick={() => setTahfidzViewMode('list')}><List className="w-4 h-4" /></Button>
            </div>
          </div>
          {tahfidzViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_SURAHS.slice(0, 37).reverse().map((surah) => (
                <Card key={surah.number} className="glass-card border-none bg-card/40 hover:border-primary/20 transition-all flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="text-[10px] font-bold">Surat ke-{surah.number}</Badge>
                      <span className="text-2xl font-headline text-primary">{surah.arabicName}</span>
                    </div>
                    <CardTitle className="text-lg mt-1">{surah.name}</CardTitle>
                    <CardDescription className="text-[10px] uppercase tracking-widest">{surah.totalVerses} Ayat</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                    <Button className="flex-1 bg-primary text-primary-foreground font-bold text-xs h-9 rounded-full" onClick={() => setSelectedItemForSetoran({ name: surah.name, type: 'surah' })}><Mic className="w-3 h-3 mr-2" />Setor Hafalan</Button>
                    {tahfidzSubmissions.includes(surah.name) && <div className="bg-emerald-500/10 p-2 rounded-full"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-card border-none bg-card/40 overflow-hidden">
              <div className="divide-y divide-white/5">
                {ALL_SURAHS.slice(0, 37).reverse().map((surah) => (
                  <div key={surah.number} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center font-mono text-[10px]">{surah.number}</div>
                      <div><h4 className="font-bold text-sm">{surah.name}</h4><p className="text-[10px] text-muted-foreground uppercase">{surah.totalVerses} Ayat</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-headline mr-4 opacity-60">{surah.arabicName}</span>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] rounded-full border-primary/20 font-bold" onClick={() => setSelectedItemForSetoran({ name: surah.name, type: 'surah' })}><Mic className="w-3 h-3 mr-1" />Setor</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : activeTab === 'hadits' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="w-6 h-6 text-primary" />30 Hadits Pilihan 📜</h2>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Cari hadits..." className="pl-9 glass-card h-12" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HADITS_LIST.filter(h => h.title.toLowerCase().includes(searchQuery.toLowerCase())).map((hadits) => (
              <Card key={hadits.id} className="glass-card border-none bg-card/40 flex flex-col">
                <CardHeader className="pb-2"><div className="flex justify-between"><Badge variant="outline">Hadits {hadits.id}</Badge><span className="text-xs text-muted-foreground">{hadits.source}</span></div><CardTitle className="text-lg mt-2">{hadits.title}</CardTitle></CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <div className="p-4 rounded-lg bg-white/5 relative group"><p className="text-2xl text-right font-headline text-primary">{hadits.arabic}</p><Button variant="ghost" size="icon" className="absolute top-2 left-2 opacity-0 group-hover:opacity-100" onClick={() => { navigator.clipboard.writeText(hadits.arabic); toast({ title: "Disalin" }); }}><Copy className="w-3 h-3" /></Button></div>
                  <p className="text-sm text-muted-foreground italic">"{hadits.translation}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : activeTab === 'doa' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2"><HandHeart className="w-6 h-6 text-accent" />30 Doa & Dzikir Harian 🙏</h2>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Cari doa..." className="pl-9 glass-card h-12" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOA_LIST.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase())).map((doa) => (
              <Card key={doa.id} className="glass-card border-none bg-card/40">
                <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-lg">{doa.title}</CardTitle><Badge>{doa.category}</Badge></div></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-3xl text-right font-headline">{doa.arabic}</p>
                  <p className="text-xs font-bold text-accent italic">{doa.latin}</p>
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2"><Info className="w-3 h-3 text-primary" /><span className="text-[10px] uppercase font-bold text-muted-foreground">Selesaikan Tugas</span></div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button size="sm" variant="outline" className="h-9 border-primary/20" onClick={() => setSelectedItemForSetoran({ name: doa.title, type: 'doa' })}><Mic className="w-3 h-3 mr-2" />Rekam</Button>
                      <Button size="sm" variant="outline" className="h-9 border-accent/20"><Play className="w-3 h-3 mr-2" />Play</Button>
                      <Button size="sm" variant="outline" className="h-9"><Send className="w-3 h-3 mr-2" />Kirim</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : activeTab === 'mutabaah' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-secondary/30 p-4 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <CalendarIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">Laporan Harian</h3>
                <p className="text-xs text-muted-foreground">Isi mutaba'ah untuk mendapatkan EXP harian.</p>
              </div>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="glass-card gap-2 font-bold min-w-[200px]">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "eeee, d MMMM yyyy", { locale: id })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => isAfter(date, new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

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
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-secondary/40 border-white/5 text-muted-foreground hover:bg-secondary/60"
                  )}
                >
                  <span className="font-bold text-sm mb-1">{prayer}</span>
                  <span className="text-[10px] font-bold">+50 EXP</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center", completedSunnah.includes(item) ? "bg-primary border-primary" : "border-white/20")}>
                          {completedSunnah.includes(item) && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={cn("text-sm font-medium", completedSunnah.includes(item) ? "text-foreground" : "text-muted-foreground")}>{item}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">+{EXP_VALUES.DAILY_ACTIVITY} EXP</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Audio & Fokus</h3>
              <Card className="glass-card border-accent/20 bg-accent/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/20 p-3 rounded-xl"><Volume2 className="w-6 h-6 text-accent" /></div>
                    <div><h4 className="font-bold">Waktu Murottal</h4><p className="text-xs text-muted-foreground">Menit mendengarkan hari ini</p></div>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-xl p-4 border border-white/10 text-3xl font-mono font-bold">{murottalMinutes}</div>
                  <p className="text-xs text-muted-foreground italic">{lastSurahPlayed ? `Terakhir: Surat ${lastSurahPlayed}` : "Belum ada murottal"}</p>
                </CardContent>
              </Card>

              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Ringkasan Tilawah</h3>
              <Card className="glass-card border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Progress Setoran</CardTitle>
                </CardHeader>
                <CardContent>
                  {tahfidzSubmissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tahfidzSubmissions.map((s, i) => <Badge key={i} className="bg-primary">{s}</Badge>)}
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto opacity-50"><AlertCircle className="w-6 h-6 text-muted-foreground" /></div>
                      <p className="text-sm text-muted-foreground italic">Belum ada setoran hari ini</p>
                      <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-bold tracking-widest" onClick={() => setActiveTab('tahfidz')}>Ke Tab Tahfidz</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : activeTab === 'rank' ? (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative overflow-hidden rounded-[3rem] p-1 bg-gradient-to-br from-blue-600 via-red-500 to-yellow-500 shadow-2xl">
            <div className="bg-background/90 backdrop-blur-xl rounded-[2.9rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 blur-[100px] rounded-full"></div>
              
              <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary blur-3xl opacity-30 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-32 h-32 md:w-48 md:h-48 rounded-full border-8 border-primary bg-card shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                    <span className="text-6xl md:text-8xl animate-bounce">{currentRank.icon}</span>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-headline font-bold text-lg uppercase tracking-widest shadow-xl">
                    {currentRank.name}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter bg-gradient-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent">
                    PAHLAWAN AL-QURAN
                  </h2>
                  <p className="text-muted-foreground text-lg uppercase tracking-[0.3em] font-medium">Power Level: {user.totalExp.toLocaleString()} EXP</p>
                </div>

                <div className="w-full max-w-2xl space-y-4">
                  <div className="flex justify-between items-end text-sm font-bold">
                    <div className="flex flex-col items-start">
                      <span className="text-primary uppercase tracking-widest text-[10px]">Rank Saat Ini</span>
                      <span className="text-xl">{currentRank.name}</span>
                    </div>
                    {nextRank && (
                      <div className="flex flex-col items-end">
                        <span className="text-accent uppercase tracking-widest text-[10px]">Target Berikutnya</span>
                        <span className="text-xl">{nextRank.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative h-6 bg-secondary/50 rounded-full border border-white/10 overflow-hidden shadow-inner">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-primary to-accent transition-all duration-1000 ease-out"
                      style={{ width: `${expProgress}%` }}
                    >
                      <div className="absolute top-0 right-0 h-full w-4 bg-white/30 skew-x-12 animate-shine"></div>
                    </div>
                  </div>
                  {nextRank && (
                    <p className="text-sm font-medium text-muted-foreground">
                      Butuh <span className="text-accent font-bold">{(nextRank.minExp - user.totalExp).toLocaleString()} EXP</span> lagi untuk mencapai kekuatan <span className="text-foreground font-bold">{nextRank.name}</span>!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-headline font-bold flex items-center gap-3">
                <Medal className="w-8 h-8 text-yellow-500" />
                Pencapaian Pahlawan
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Sakti Berdoa", icon: <Sparkles className="w-6 h-6" />, desc: "Hafal 30 Doa", color: "text-blue-400" },
                  { title: "Pakar Hadits", icon: <ScrollText className="w-6 h-6" />, desc: "Hafal 30 Hadits", color: "text-red-400" },
                  { title: "Super Streak", icon: <Zap className="w-6 h-6" />, desc: "7 Hari Tanpa Putus", color: "text-yellow-400" },
                  { title: "Pelindung Masjid", icon: <Shield className="w-6 h-6" />, desc: "Sholat 5 Waktu Tepat", color: "text-green-400" },
                ].map((item, i) => (
                  <Card key={i} className="glass-card border-white/5 bg-white/5 hover:scale-105 transition-transform cursor-pointer">
                    <CardContent className="p-6 text-center space-y-3">
                      <div className={cn("w-12 h-12 mx-auto rounded-full bg-background flex items-center justify-center shadow-lg border border-white/10", item.color)}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase">{item.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-headline font-bold flex items-center gap-3">
                <Crown className="w-8 h-8 text-accent" />
                Galeri Peringkat
              </h3>
              <div className="space-y-3">
                {RANKS.map((rank) => {
                  const isCurrent = currentRank.name === rank.name;
                  const isUnlocked = user.totalExp >= rank.minExp;
                  
                  return (
                    <div 
                      key={rank.name}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-all",
                        isCurrent ? "bg-primary/20 border-primary ring-2 ring-primary/50 shadow-xl scale-105" :
                        isUnlocked ? "bg-secondary/40 border-white/10 opacity-80" :
                        "bg-background border-dashed border-white/5 opacity-40 grayscale"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{rank.icon}</span>
                        <div>
                          <h4 className="font-bold uppercase tracking-tighter">{rank.name}</h4>
                          <p className="text-[10px] text-muted-foreground">{rank.minExp.toLocaleString()} EXP Minimal</p>
                        </div>
                      </div>
                      {isCurrent ? (
                        <Badge className="bg-primary animate-pulse">AKTIF</Badge>
                      ) : !isUnlocked ? (
                        <div className="bg-secondary/50 p-1 rounded-full"><Hourglass className="w-4 h-4 text-muted-foreground" /></div>
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Card className="glass-card border-none bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-red-900/40 p-8 text-center space-y-4">
             <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                <Sword className="w-8 h-8 text-yellow-400" />
             </div>
             <h3 className="text-2xl font-headline font-bold">Siap Menuju Level Berikutnya?</h3>
             <p className="text-muted-foreground max-w-md mx-auto">
               Setiap ayat yang kamu baca, setiap doa yang kamu hafal, adalah kekuatan baru bagimu. Teruslah berjuang, Pahlawan Al-Quran!
             </p>
             <Button 
               className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-6 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)]"
               onClick={() => setActiveTab('tahfidz')}
             >
               AMBIL TUGAS BARU
               <ArrowRight className="w-4 h-4 ml-2" />
             </Button>
          </Card>
        </div>
      ) : (
        <Card className="glass-card p-12 text-center"><p className="text-muted-foreground">Halaman {activeTab} sedang dikembangkan.</p></Card>
      )}

      <Dialog open={isAttendanceModalOpen} onOpenChange={setIsAttendanceModalOpen}>
        <DialogContent className="glass-card sm:max-w-md border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-accent" />
              Progres Kehadiran & Setoran
            </DialogTitle>
            <DialogDescription>
              Detail laporan ibadah harian bulan {format(new Date(), "MMMM yyyy", { locale: id })}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid grid-cols-7 gap-2">
              {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, idx) => (
                <div key={`${day}-${idx}`} className="text-center text-[10px] font-bold text-muted-foreground">{day}</div>
              ))}
              {attendanceDays.map((day, idx) => {
                const report = MOCK_ATTENDANCE.find(a => isSameDay(a.date, day));
                const isFuture = isAfter(day, new Date());
                const hasReport = report?.hasReport;
                
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-all relative group",
                      isFuture ? "bg-secondary/20 text-muted-foreground/30" :
                      hasReport ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
                      "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {format(day, "d")}
                    {!isFuture && !hasReport && (
                      <XCircle className="absolute -top-1 -right-1 w-3 h-3 text-white fill-destructive opacity-0 group-hover:opacity-100" />
                    )}
                    {!isFuture && hasReport && (
                      <CheckCircle2 className="absolute -top-1 -right-1 w-3 h-3 text-white fill-primary opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>Setoran Berhasil / Hadir</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="w-3 h-3 rounded bg-destructive"></div>
                <span className="text-destructive font-bold">Tidak Ada Laporan / Alpha</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button className="w-full bg-accent text-accent-foreground" onClick={() => setIsAttendanceModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedItemForSetoran} onOpenChange={() => !isRecording && setSelectedItemForSetoran(null)}>
        <DialogContent className="glass-card sm:max-w-md border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mic className="w-5 h-5 text-primary" />Setoran: {selectedItemForSetoran?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center", isRecording ? "bg-red-500 animate-pulse" : "bg-primary/20")}>
              {isRecording ? <Square className="w-8 h-8 text-white fill-current" /> : <Mic className="w-10 h-10 text-primary" />}
            </div>
            <div className="text-3xl font-mono font-bold">{Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</div>
            {audioUrl && !isRecording && <audio src={audioUrl} controls className="w-full" />}
          </div>
          <DialogFooter className="flex-row gap-2">
            {!audioUrl ? (
              <Button className={cn("flex-1 h-12", isRecording ? "bg-red-500" : "bg-primary")} onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? "Berhenti" : "Mulai Rekam"}
              </Button>
            ) : (
              <><Button variant="outline" className="flex-1 h-12" onClick={() => setAudioUrl(null)}>Ulangi</Button><Button className="flex-1 h-12" onClick={sendRecording}>Kirim</Button></>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
