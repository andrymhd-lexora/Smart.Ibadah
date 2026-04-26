
"use client"

import { useState, useEffect, useRef, useMemo } from "react";
import { UserProfile, IbadahLog, HafalanSubmission } from "@/lib/types";
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
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, query, where, serverTimestamp, doc } from "firebase/firestore";

interface SantriDashboardProps {
  user: UserProfile;
}

type SantriTab = 'ringkasan' | 'tugas-guru' | 'talaqqi' | 'tahfidz' | 'hadits' | 'doa' | 'mutabaah' | 'rank';
type TaskStatus = 'Semua' | 'Belum Setor' | 'Menunggu Nilai' | 'Sudah Dinilai';

const QORIS = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.shaatree', name: 'Abu Bakr Al-Shatri' },
  { id: 'ar.juhany', name: 'Abdullah Al-Juhany' },
  { id: 'ar.husary', name: 'Mahmoud Al-Husary' },
  { id: 'ar.rifai', name: 'Hani Ar-Rifa\'i' },
];

export function SantriDashboard({ user }: SantriDashboardProps) {
  const [activeTab, setActiveTab] = useState<SantriTab>('ringkasan');
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const db = useFirestore();

  const [selectedQori, setSelectedQori] = useState(QORIS[0]);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [murottalMinutes, setMurottalMinutes] = useState(0);
  const [lastSurahPlayed, setLastSurahPlayed] = useState<string | null>(null);
  const murottalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Fetch real submissions for today
  const submissionsQuery = useMemoFirebase(() => {
    if (!db || !user.uid) return null;
    return query(
      collection(db, `users/${user.uid}/ibadahLogs/${dateString}/hafalanSubmissions`),
    );
  }, [db, user.uid, dateString]);

  const { data: todaySubmissions } = useCollection<HafalanSubmission>(submissionsQuery);

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
      assignedUstadzId: 'MOCK_USTADZ_ID' // For prototyping, usually comes from user profile
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_SURAHS.slice(0, 37).reverse().map((surah) => {
              const hasSubmitted = todaySubmissions?.some(s => s.hafalanContent.includes(surah.name));
              return (
                <Card key={surah.number} className={cn("glass-card border-none bg-card/40 hover:border-primary/20 transition-all flex flex-col", hasSubmitted && "ring-1 ring-emerald-500/50 bg-emerald-500/5")}>
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
                    {hasSubmitted && <div className="bg-emerald-500/20 p-2 rounded-full"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>}
                  </CardContent>
                </Card>
              );
            })}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Ringkasan Tilawah</h3>
              <Card className="glass-card border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary" /> Progress Setoran</CardTitle>
                </CardHeader>
                <CardContent>
                  {todaySubmissions && todaySubmissions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {todaySubmissions.map((s, i) => (
                        <Badge key={i} className={cn(
                          s.status === 'VERIFIED' ? "bg-emerald-600" : "bg-primary"
                        )}>
                          {s.hafalanContent} {s.status === 'VERIFIED' && '✓'}
                        </Badge>
                      ))}
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
      ) : (
        <Card className="glass-card p-12 text-center"><p className="text-muted-foreground">Halaman {activeTab} sedang aktif.</p></Card>
      )}

      {/* Recording Dialog */}
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
