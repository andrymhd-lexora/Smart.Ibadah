"use client"

import { useState, useEffect, useRef } from "react";
import { UserProfile, HafalanSubmission, IbadahLog } from "@/lib/types";
import { 
  getRankByExp, 
  getNextRank, 
  RANKS,
  EXP_VALUES,
  PRAYERS_WAJIB,
  DAILY_IBADAH
} from "@/lib/constants";
import { 
  Trophy,
  BrainCircuit,
  Target,
  CheckCircle2,
  LayoutDashboard,
  Flame,
  Mic,
  Square,
  AlertCircle,
  Zap,
  Shield,
  Medal,
  Sparkles,
  Rocket,
  Sword,
  Crown,
  Bolt,
  Radio,
  ScrollText,
  Play,
  Pause,
  Volume2,
  BookOpen,
  Heart,
  ChevronRight,
  History,
  Clock,
  Search,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ALL_SURAHS } from "@/lib/quran-data";
import { HADITS_LIST, DOA_LIST } from "@/lib/hadits-doa-data";
import { format } from "date-fns";
import { useFirestore, useCollection, useDoc, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase";
import { collection, query, doc } from "firebase/firestore";

interface SantriDashboardProps {
  user: UserProfile;
}

type SetoranItem = {
  name: string;
  type: 'surah' | 'doa' | 'hadits';
  arabic?: string;
  latin?: string;
  translation?: string;
  source?: string;
};

type SantriTab = 'ringkasan' | 'tugas-guru' | 'talaqqi' | 'tahfidz' | 'hadits' | 'doa' | 'mutabaah' | 'rank';

const QORIS = [
  { id: 'mishary', name: 'Mishary Rashid Alafasy', slug: 'afs', server: 'server8' },
  { id: 'basit', name: 'AbdulBaset AbdulSamad', slug: 'basit', server: 'server7' },
  { id: 'shuraim', name: 'Saud Al-Shuraim', slug: 'shur', server: 'server7' },
  { id: 'minshawi', name: 'Al-Minshawi', slug: 'minsh', server: 'server10' },
];

export function SantriDashboard({ user }: SantriDashboardProps) {
  const [activeTab, setActiveTab] = useState<SantriTab>('ringkasan');
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const db = useFirestore();

  // Murottal States
  const [selectedQori, setSelectedQori] = useState(QORIS[0]);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [murottalSearch, setMurottalSearch] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [selectedDate] = useState<Date>(new Date());
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Setoran States
  const [selectedItemForSetoran, setSelectedItemForSetoran] = useState<SetoranItem | null>(null);
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

  // Firestore Data
  const submissionsQuery = useMemoFirebase(() => {
    if (!db || !user.uid) return null;
    return query(collection(db, `users/${user.uid}/ibadahLogs/${dateString}/hafalanSubmissions`));
  }, [db, user.uid, dateString]);

  const { data: todaySubmissions } = useCollection<HafalanSubmission>(submissionsQuery);

  const logDocRef = useMemoFirebase(() => {
    if (!db || !user.uid) return null;
    return doc(db, `users/${user.uid}/ibadahLogs`, dateString);
  }, [db, user.uid, dateString]);

  const { data: ibadahLog } = useDoc<IbadahLog>(logDocRef);

  useEffect(() => {
    async function fetchMotivation() {
      setLoadingMotivation(true);
      try {
        const result = await getPersonalizedMotivation({
          name: user.name,
          currentExp: user.totalExp,
          expNeededForNextRank: expNeeded,
          nextRankName: nextRank?.name || "Peringkat Maksimal",
          suggestedActivity: "Misi Tahfidz Epik"
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

  // Audio Control
  const togglePlaySurah = (surahNumber: number) => {
    if (playingSurah === surahNumber) {
      audioRef.current?.pause();
      setPlayingSurah(null);
    } else {
      const paddedNumber = surahNumber.toString().padStart(3, '0');
      const url = `https://${selectedQori.server}.mp3quran.net/${selectedQori.slug}/${paddedNumber}.mp3`;
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingSurah(surahNumber);
      }
    }
  };

  const handleTogglePrayer = (prayer: string) => {
    if (!db || !user.uid) return;
    const currentPrayers = ibadahLog?.activities?.prayers || [];
    const newPrayers = currentPrayers.includes(prayer) 
      ? currentPrayers.filter(p => p !== prayer)
      : [...currentPrayers, prayer];
    
    const newLog: Partial<IbadahLog> = {
      uid: user.uid,
      date: dateString,
      activities: {
        ...(ibadahLog?.activities || { quranPages: 0, hafalanText: '', others: [], dzikir: false, murottalMinutes: 0 }),
        prayers: newPrayers
      },
      awardedExp: (ibadahLog?.awardedExp || 0) + (currentPrayers.includes(prayer) ? -EXP_VALUES.SHOLAT_WAJIB : EXP_VALUES.SHOLAT_WAJIB),
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(logDocRef!, newLog, { merge: true });
    
    const userRef = doc(db, 'users', user.uid);
    setDocumentNonBlocking(userRef, { 
      totalExp: user.totalExp + (currentPrayers.includes(prayer) ? -EXP_VALUES.SHOLAT_WAJIB : EXP_VALUES.SHOLAT_WAJIB),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({
      title: currentPrayers.includes(prayer) ? "Misi Dibatalkan" : "Misi Berhasil!",
      description: `${prayer} telah tercatat dalam log energi spiritualmu.`,
    });
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
    if (!selectedItemForSetoran || !db || !user.uid) return;

    const submissionData = {
      santriId: user.uid,
      santriName: user.name,
      ibadahLogId: dateString,
      submissionDate: new Date().toISOString(),
      hafalanContent: `Misi Berhasil: ${selectedItemForSetoran.name} (${selectedItemForSetoran.type.toUpperCase()})`,
      status: 'PENDING_REVIEW',
      expAwarded: selectedItemForSetoran.type === 'surah' ? 200 : 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedUstadzId: user.assignedUstadzId || 'MOCK_USTADZ_ID'
    };

    const submissionRef = collection(db, `users/${user.uid}/ibadahLogs/${dateString}/hafalanSubmissions`);
    addDocumentNonBlocking(submissionRef, submissionData);

    toast({ title: "Misi Terkirim!", description: `Bukti hafalan ${selectedItemForSetoran?.name} telah dikirim ke Markas Besar Ustadz.` });
    setSelectedItemForSetoran(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const navItems = [
    { id: 'ringkasan', label: 'Markas Utama', icon: LayoutDashboard },
    { id: 'tahfidz', label: 'Misi Hafalan', icon: Sword },
    { id: 'talaqqi', label: 'Radio Murottal', icon: Radio },
    { id: 'hadits', label: 'Arsip Hadits', icon: ScrollText },
    { id: 'doa', label: 'Kekuatan Doa', icon: Zap },
    { id: 'mutabaah', label: 'Log Aktivitas', icon: CheckCircle2 },
    { id: 'rank', label: 'Level Hero', icon: Trophy },
  ];

  const filteredMurottal = ALL_SURAHS.filter(s => 
    s.name.toLowerCase().includes(murottalSearch.toLowerCase()) || 
    s.number.toString() === murottalSearch
  );

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <audio ref={audioRef} onEnded={() => setPlayingSurah(null)} className="hidden" />

      {/* Navigation */}
      <Card className="glass-card border-none bg-black/40 overflow-hidden sticky top-20 z-40 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex p-3 gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SantriTab)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all duration-300",
                  activeTab === item.id 
                    ? "bg-gradient-to-r from-primary to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                <item.icon className={cn("w-4 h-4", activeTab === item.id && "animate-pulse")} />
                {item.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>

      {activeTab === 'ringkasan' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative p-1 rounded-[2rem] bg-gradient-to-r from-primary via-accent to-destructive animate-gradient-x">
            <Card className="glass-card border-none bg-[#0f172a] rounded-[1.9rem] overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Crown className="w-48 h-48 rotate-12" />
              </div>
              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/20 blur-[30px] rounded-full animate-pulse"></div>
                    <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-primary to-emerald-800 border-4 border-white flex items-center justify-center text-8xl shadow-2xl">
                      {currentRank.icon}
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-[0.2em]">
                      <Bolt className="w-4 h-4 fill-current" />
                      Status: {currentRank.name} Terdeteksi
                    </div>
                    <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tighter text-white drop-shadow-md">
                      {user.name}
                    </h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                        <Flame className="w-5 h-5 text-orange-500 fill-current" />
                        <span className="text-xl font-black text-white">{user.streak} <span className="text-xs text-muted-foreground uppercase">HARI</span></span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-white/5">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-xl font-black text-white">{user.totalExp.toLocaleString()} <span className="text-xs text-muted-foreground uppercase">POWER</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 space-y-4">
                  <div className="flex justify-between items-end px-1">
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/50">Energi Level Berikutnya</p>
                      <p className="text-sm font-bold text-primary italic">Menuju {nextRank?.name || 'Maksimal'}</p>
                    </div>
                    <span className="text-2xl font-black text-white">{Math.round(expProgress)}%</span>
                  </div>
                  <div className="relative h-6 bg-black/50 rounded-full border-2 border-white/10 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-accent to-primary shimmer-effect transition-all duration-1000"
                      style={{ width: `${expProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 glass-card border-none bg-card/40 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <CardHeader>
                <div className="flex items-center gap-3 text-primary text-lg font-black uppercase tracking-wider">
                  <div className="p-2 bg-primary/20 rounded-lg"><BrainCircuit className="w-6 h-6" /></div>
                  Pusat Intelijen Ustadz AI
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-2xl bg-black/40 border border-white/5 relative">
                  <div className="absolute top-4 right-4"><Sparkles className="w-5 h-5 text-accent animate-spin-slow" /></div>
                  <p className="text-lg md:text-xl font-medium leading-relaxed italic text-white/90">
                    "{loadingMotivation ? "Mengakses basis data hikmah..." : motivation}"
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none bg-card/40 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center text-accent animate-bounce">
                <Rocket className="w-10 h-10" />
              </div>
              <h3 className="font-black uppercase tracking-wider">Misi Spesial</h3>
              <p className="text-sm text-muted-foreground">Selesaikan 5 hafalan hari ini untuk booster 500 EXP!</p>
              <Button 
                variant="outline" 
                className="w-full border-accent/30 text-accent hover:bg-accent/10"
                onClick={() => setActiveTab('tahfidz')}
              >Lihat Detail</Button>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'tahfidz' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="relative p-1 rounded-3xl bg-gradient-to-r from-emerald-500 to-blue-600">
            <div className="bg-[#0f172a] rounded-[1.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center md:text-left">
                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Sword className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Laboratorium Hafalan</h2>
                  <p className="text-muted-foreground">Kirimkan kekuatan ayatmu ke Markas Besar.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ALL_SURAHS.slice(0, 37).reverse().map((surah) => {
              const sub = todaySubmissions?.find(s => s.hafalanContent.includes(surah.name));
              return (
                <Card key={surah.number} className={cn(
                  "glass-card border-none bg-card/40 group hover:bg-card/60 transition-all",
                  sub && "ring-2 ring-primary/50"
                )}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Surah Ke-{surah.number}</p>
                        <h4 className="text-xl font-black text-white">{surah.name}</h4>
                      </div>
                      <span className="text-3xl font-headline text-white/20 group-hover:text-primary/40 transition-colors">{surah.arabicName}</span>
                    </div>
                    <Button 
                      className={cn(
                        "w-full h-12 font-black uppercase tracking-wider rounded-xl",
                        sub ? "bg-primary/20 text-primary border border-primary/30" : "bg-primary text-white"
                      )}
                      onClick={() => setSelectedItemForSetoran({ 
                        name: surah.name, 
                        type: 'surah',
                        arabic: surah.arabicName,
                        translation: `Surat ke-${surah.number} dari Al-Quran.`
                      })}
                    >
                      {sub ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> TERKIRIM</>
                      ) : (
                        <><Mic className="w-4 h-4 mr-2" /> MULAI MISI</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'talaqqi' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="relative p-10 rounded-[3rem] bg-[#0f172a] border-4 border-primary/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] overflow-hidden">
             <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full"></div>
             <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="space-y-6 text-center md:text-left flex-1">
                 <div className="inline-flex p-4 rounded-full bg-primary/20 border-2 border-primary/30 animate-pulse">
                   <Radio className="w-12 h-12 text-primary" />
                 </div>
                 <div className="space-y-2">
                   <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Radio Murottal Epik</h2>
                   <p className="text-muted-foreground">Pilih frekuensi Qori dan dengarkan seluruh 114 surat Al-Quran.</p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-black uppercase text-white/40 ml-1">Pilih Transmiter Qori</label>
                      <Select value={selectedQori.id} onValueChange={(val) => {
                        const q = QORIS.find(q => q.id === val);
                        if (q) setSelectedQori(q);
                      }}>
                        <SelectTrigger className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold">
                          <SelectValue placeholder="Pilih Qori" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12141c] border-white/10 text-white">
                          {QORIS.map(q => (
                            <SelectItem key={q.id} value={q.id}>{q.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 flex-1">
                      <label className="text-[10px] font-black uppercase text-white/40 ml-1">Cari Frekuensi Surat</label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input 
                          placeholder="Nama surat atau nomor..." 
                          value={murottalSearch}
                          onChange={(e) => setMurottalSearch(e.target.value)}
                          className="h-14 pl-12 bg-black/40 border-white/10 rounded-2xl text-white font-bold"
                        />
                      </div>
                    </div>
                 </div>
               </div>

               <div className="w-full max-sm:w-full max-w-sm bg-black/60 p-8 rounded-[2.5rem] border-2 border-white/5 space-y-8 backdrop-blur-xl">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Live Stream</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-primary animate-bounce"></div>
                      <div className="w-1 h-5 bg-primary animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1 h-2 bg-primary animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                 </div>
                 <div className="space-y-2 text-center">
                    <div className="text-3xl font-black text-white tracking-tighter">
                      {playingSurah ? ALL_SURAHS.find(s => s.number === playingSurah)?.name : "Standby..."}
                    </div>
                    <div className="text-xs font-bold text-muted-foreground uppercase">{selectedQori.name}</div>
                 </div>
                 <div className="flex flex-col gap-6">
                   <div className="flex items-center gap-4">
                     <Volume2 className="w-5 h-5 text-white/50" />
                     <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-2/3 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                     </div>
                   </div>
                   <div className="flex justify-center">
                     <Button 
                       size="icon" 
                       className={cn(
                        "h-20 w-20 rounded-full shadow-2xl transition-all duration-500",
                        playingSurah ? "bg-primary hover:bg-primary/90 scale-110" : "bg-white/10 hover:bg-white/20"
                       )}
                       onClick={() => playingSurah && togglePlaySurah(playingSurah)}
                       disabled={!playingSurah}
                     >
                        {playingSurah ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current" />}
                     </Button>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {filteredMurottal.map((surah) => (
               <Card 
                 key={surah.number} 
                 className={cn(
                  "glass-card border-none bg-card/40 hover:bg-card/60 transition-all cursor-pointer group",
                  playingSurah === surah.number && "ring-2 ring-primary bg-primary/10"
                 )}
                 onClick={() => togglePlaySurah(surah.number)}
               >
                 <CardContent className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-colors",
                      playingSurah === surah.number ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                     )}>
                      {surah.number}
                     </div>
                     <div>
                       <div className="font-black text-white text-sm">{surah.name}</div>
                       <div className="text-[10px] text-muted-foreground uppercase">{surah.revelationType} • {surah.totalVerses} Ayat</div>
                     </div>
                   </div>
                   <div className="relative">
                     {playingSurah === surah.number ? (
                       <Pause className="w-5 h-5 text-primary fill-current" />
                     ) : (
                       <Play className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors fill-current" />
                     )}
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'hadits' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/20 text-primary"><ScrollText className="w-8 h-8" /></div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Arsip Hadits</h2>
                <p className="text-muted-foreground">Koleksi hikmah untuk memperkuat adab pahlawan.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {HADITS_LIST.map((hadits) => (
               <Card key={hadits.id} className="glass-card border-none bg-card/40 group hover:border-primary/20 border transition-all">
                 <CardHeader>
                   <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-primary/20 text-primary border-none">{hadits.source}</Badge>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">#H-{hadits.id}</span>
                   </div>
                   <CardTitle className="text-xl font-black text-primary">{hadits.title}</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <p className="text-2xl font-serif text-right text-white leading-relaxed mb-4">{hadits.arabic}</p>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{hadits.translation}"</p>
                   </div>
                   <Button 
                    className="w-full bg-primary/20 text-primary font-black uppercase tracking-widest text-xs h-10 rounded-xl"
                    onClick={() => setSelectedItemForSetoran({
                      name: hadits.title,
                      type: 'hadits',
                      arabic: hadits.arabic,
                      translation: hadits.translation,
                      source: hadits.source
                    })}
                   >
                    HAFALKAN MISI
                   </Button>
                 </CardContent>
               </Card>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'doa' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-accent/20 text-accent"><Zap className="w-8 h-8" /></div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Kekuatan Doa</h2>
                <p className="text-muted-foreground">Senjata paling ampuh bagi setiap pahlawan spiritual.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {DOA_LIST.map((doa) => (
               <Card key={doa.id} className="glass-card border-none bg-card/40 hover:scale-[1.02] transition-all">
                 <CardHeader className="pb-2">
                   <Badge variant="outline" className="w-fit mb-2 border-accent/30 text-accent text-[10px]">{doa.category}</Badge>
                   <CardTitle className="text-lg font-black">{doa.title}</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <p className="text-xl font-serif text-right text-white/90 leading-relaxed">{doa.arabic}</p>
                   <div className="space-y-2">
                     <p className="text-[10px] text-white/40 italic font-mono">{doa.latin}</p>
                     <p className="text-xs text-muted-foreground leading-relaxed">{doa.translation}</p>
                   </div>
                   <Button 
                    className="w-full bg-accent text-white font-black uppercase tracking-widest text-xs h-10 rounded-xl"
                    onClick={() => setSelectedItemForSetoran({
                      name: doa.title,
                      type: 'doa',
                      arabic: doa.arabic,
                      latin: doa.latin,
                      translation: doa.translation
                    })}
                   >
                    HAFALKAN MISI
                   </Button>
                 </CardContent>
               </Card>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'mutabaah' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="relative p-12 rounded-[3rem] bg-gradient-to-br from-[#0f172a] to-[#1e293b] border-4 border-white/5 overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.1)_0%,transparent_50%)]"></div>
             <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">Log Aktivitas Pahlawan</h2>
                  <p className="text-muted-foreground max-w-md">Catat setiap kemenangan spiritualmu hari ini untuk mengumpulkan energi level.</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                    <div className="px-6 py-3 bg-primary/20 rounded-2xl border border-primary/30">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Energi Terkumpul</p>
                      <p className="text-2xl font-black text-white">{(ibadahLog?.awardedExp || 0).toLocaleString()} <span className="text-xs text-muted-foreground">EXP</span></p>
                    </div>
                  </div>
               </div>
               <div className="w-full max-sm:w-full max-w-xs p-6 bg-black/40 rounded-3xl border border-white/5 text-center space-y-4">
                  <div className="text-xs font-black uppercase tracking-widest text-white/50">Waktu Operasi</div>
                  <div className="text-3xl font-black text-white">{format(new Date(), 'HH:mm')}</div>
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-4 py-1 uppercase font-black">Status: Aktif</Badge>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-card border-none bg-card/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white uppercase tracking-wider">
                    <History className="w-5 h-5 text-primary" /> Misi Sholat Wajib
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PRAYERS_WAJIB.map((prayer) => {
                    const isDone = ibadahLog?.activities?.prayers?.includes(prayer);
                    return (
                      <div 
                        key={prayer} 
                        className={cn(
                          "flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer",
                          isDone ? "bg-primary/10 border-primary/30" : "bg-black/20 border-white/5 hover:bg-black/40"
                        )}
                        onClick={() => handleTogglePrayer(prayer)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn("w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors", isDone ? "bg-primary border-primary" : "border-white/20")}>
                            {isDone && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <span className={cn("font-bold text-lg", isDone ? "text-white" : "text-white/50")}>{prayer}</span>
                        </div>
                        <Badge variant="outline" className={cn("border-none text-xs font-black", isDone ? "text-primary" : "text-white/20")}>+50 EXP</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="glass-card border-none bg-card/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white uppercase tracking-wider">
                      <Target className="w-5 h-5 text-accent" /> Misi Khusus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {DAILY_IBADAH.map((task) => (
                       <div key={task} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5 hover:bg-black/40 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Zap className="w-5 h-5 text-muted-foreground group-hover:text-accent" />
                          </div>
                          <span className="font-bold text-white/70">{task}</span>
                        </div>
                        <Badge variant="outline" className="border-none text-accent/50 text-xs font-black">+40 EXP</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="glass-card border-none bg-card/40 p-8 flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="w-10 h-10" />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-black text-white uppercase">Konsistensi Pahlawan</h3>
                     <p className="text-sm text-muted-foreground">Pertahankan streakmu selama 7 hari untuk membuka hadiah misterius!</p>
                   </div>
                   <div className="w-full flex justify-center gap-2">
                     {[1,2,3,4,5,6,7].map(i => (
                       <div key={i} className={cn("w-3 h-3 rounded-full", user.streak >= i ? "bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-white/10")}></div>
                     ))}
                   </div>
                </Card>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'rank' && (
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative py-24 overflow-hidden rounded-[3rem] bg-[#020617] border-4 border-primary/30 shadow-[0_0_80px_rgba(16,185,129,0.2)]">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.25)_0%,transparent_75%)]"></div>
            
            <div className="relative flex flex-col items-center text-center space-y-10">
              <div className="relative group">
                <div className="absolute -inset-12 bg-primary/40 blur-[60px] rounded-full animate-pulse group-hover:bg-accent/40 transition-colors duration-1000"></div>
                <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary via-emerald-600 to-emerald-900 border-8 border-white flex items-center justify-center text-8xl shadow-[0_0_50px_rgba(16,185,129,0.5)] transform hover:rotate-12 transition-transform duration-500">
                  {currentRank.icon}
                </div>
              </div>
              
              <div className="space-y-4 px-6">
                <h2 className="text-6xl md:text-8xl font-headline font-black tracking-tighter text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                  PAHLAWAN <span className="text-primary italic">CAHAYA</span>
                </h2>
                <div className="inline-flex gap-4">
                  <Badge className="bg-white text-black font-black px-6 py-2 text-xl rounded-2xl shadow-xl">{currentRank.name}</Badge>
                  <Badge className="bg-accent text-white font-black px-6 py-2 text-xl rounded-2xl shadow-xl">LEVEL {Math.floor(user.totalExp / 1000)}</Badge>
                </div>
              </div>

              <div className="w-full max-w-lg px-10 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-black uppercase text-white/60 tracking-[0.4em]">POWER CONCENTRATION</span>
                  <span className="text-lg font-black text-primary">{user.totalExp.toLocaleString()} / {nextRank?.minExp.toLocaleString() || 'MAX'}</span>
                </div>
                <div className="relative h-10 rounded-2xl bg-black/60 border-2 border-white/20 p-1 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary shimmer-effect transition-all duration-1000 rounded-xl"
                    style={{ width: `${expProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {RANKS.map((r, i) => {
              const isReached = user.totalExp >= r.minExp;
              return (
                <div key={i} className={cn(
                  "relative p-6 rounded-[2rem] text-center border-4 transition-all duration-500 hover:scale-110",
                  isReached 
                    ? "bg-primary/10 border-primary shadow-[0_0_25px_rgba(16,185,129,0.3)]" 
                    : "bg-black/40 border-white/5 opacity-30 grayscale"
                )}>
                  <div className="text-5xl mb-4 drop-shadow-md">{r.icon}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white">{r.name}</div>
                  {isReached ? <Medal className="w-5 h-5 absolute top-4 right-4 text-primary animate-bounce" /> : <Shield className="w-5 h-5 absolute top-4 right-4 text-white/20" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recording & Mission Dialog */}
      <Dialog open={!!selectedItemForSetoran} onOpenChange={() => !isRecording && setSelectedItemForSetoran(null)}>
        <DialogContent className="glass-card sm:max-w-2xl border-primary/20 bg-[#0f172a] rounded-[2rem] p-0 overflow-hidden">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-8 space-y-8">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-black text-white uppercase tracking-tighter">
                  <Bolt className="w-6 h-6 text-primary" />
                  Misi Hafalan: {selectedItemForSetoran?.name}
                </DialogTitle>
              </DialogHeader>

              {/* Teks Bacaan Lengkap */}
              <div className="p-6 rounded-3xl bg-black/40 border border-white/10 space-y-6">
                {selectedItemForSetoran?.arabic && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Teks Arab</p>
                    <p className="text-4xl md:text-5xl font-serif text-right text-white leading-relaxed">{selectedItemForSetoran.arabic}</p>
                  </div>
                )}
                {selectedItemForSetoran?.latin && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Teks Latin</p>
                    <p className="text-sm italic text-white/70 font-mono leading-relaxed">{selectedItemForSetoran.latin}</p>
                  </div>
                )}
                {selectedItemForSetoran?.translation && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">Terjemahan</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedItemForSetoran.translation}</p>
                  </div>
                )}
                {selectedItemForSetoran?.source && (
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-black">{selectedItemForSetoran.source}</Badge>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex flex-col items-center justify-center py-6 space-y-8 border-t border-white/5 pt-8">
                <div className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer",
                  isRecording ? "bg-red-500 hero-glow scale-110 shadow-[0_0_40px_rgba(239,68,68,0.5)]" : "bg-primary/20 border-2 border-primary/30 hover:bg-primary/30"
                )} onClick={isRecording ? stopRecording : startRecording}>
                  {isRecording ? <Square className="w-10 h-10 text-white fill-current animate-pulse" /> : <Mic className="w-12 h-12 text-primary" />}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-5xl font-mono font-black text-white tracking-widest bg-black/40 px-6 py-2 rounded-xl border border-white/5">
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-xs font-black uppercase text-white/30 tracking-widest">
                    {isRecording ? "Sedang Merekam..." : "Ketuk Mikrofon untuk Memulai"}
                  </p>
                </div>
                {audioUrl && !isRecording && (
                  <div className="w-full space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest text-center">Hasil Rekaman</p>
                    <audio src={audioUrl} controls className="w-full opacity-80" />
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-8 border-t border-white/5 bg-black/20">
            <DialogFooter className="flex flex-col sm:flex-row gap-4">
              {!audioUrl ? (
                <Button 
                  className={cn("flex-1 h-16 font-black uppercase tracking-widest text-lg rounded-2xl", isRecording ? "bg-red-600 hover:bg-red-700" : "bg-primary")} 
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? "HENTIKAN" : "MULAI REKAM"}
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1 h-16 font-black rounded-2xl border-white/10 hover:bg-white/5" onClick={() => setAudioUrl(null)}>ULANGI REKAMAN</Button>
                  <Button className="flex-1 h-16 bg-primary font-black rounded-2xl shadow-lg shadow-primary/20" onClick={sendRecording}>KIRIM SETORAN</Button>
                </>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
