"use client"

import { useState, useEffect, useRef } from "react";
import { UserProfile, HafalanSubmission } from "@/lib/types";
import { 
  getRankByExp, 
  getNextRank, 
  RANKS
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
  ScrollText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ALL_SURAHS } from "@/lib/quran-data";
import { format } from "date-fns";
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query } from "firebase/firestore";

interface SantriDashboardProps {
  user: UserProfile;
}

type SantriTab = 'ringkasan' | 'tugas-guru' | 'talaqqi' | 'tahfidz' | 'hadits' | 'doa' | 'mutabaah' | 'rank';

export function SantriDashboard({ user }: SantriDashboardProps) {
  const [activeTab, setActiveTab] = useState<SantriTab>('ringkasan');
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const db = useFirestore();

  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [selectedDate] = useState<Date>(new Date());
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
      hafalanContent: `Misi Berhasil: ${selectedItemForSetoran.name}`,
      status: 'PENDING_REVIEW',
      expAwarded: 100,
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

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <audio ref={audioRef} onEnded={() => setPlayingSurah(null)} />

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
              <Button variant="outline" className="w-full border-accent/30 text-accent hover:bg-accent/10">Lihat Detail</Button>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-destructive" /> Misi Harian Anda
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {['Sholat Berjamaah', 'Tilawah Subuh', 'Dzikir Pagi', 'Setoran Epik'].map((misi, i) => (
                <Card key={i} className="glass-card border-none bg-card/40 hover:scale-105 transition-transform cursor-pointer group">
                  <CardContent className="p-6 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Bolt className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="font-bold text-center text-sm">{misi}</span>
                    <Badge variant="outline" className="border-white/10 text-[10px]">+50 EXP</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                      onClick={() => setSelectedItemForSetoran({ name: surah.name, type: 'surah' })}
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

      {/* Fallback for other tabs */}
      {!['ringkasan', 'tahfidz', 'rank'].includes(activeTab) && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <Card className="glass-card border-none bg-card/40 p-12 text-center space-y-6">
              <AlertCircle className="w-20 h-20 text-muted-foreground mx-auto" />
              <h3 className="text-2xl font-black uppercase">Area Intelijen {activeTab}</h3>
              <p className="text-muted-foreground">Basis data sedang dioptimalkan untuk performa pahlawan maksimal.</p>
              <Button onClick={() => setActiveTab('ringkasan')} className="bg-primary text-white font-bold">Kembali ke Markas</Button>
           </Card>
        </div>
      )}

      {/* Recording Dialog */}
      <Dialog open={!!selectedItemForSetoran} onOpenChange={() => !isRecording && setSelectedItemForSetoran(null)}>
        <DialogContent className="glass-card sm:max-w-md border-primary/20 bg-[#0f172a] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-white uppercase tracking-tighter">
              <Bolt className="w-6 h-6 text-primary" />
              Transmisi Misi: {selectedItemForSetoran?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-10 space-y-8">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
              isRecording ? "bg-red-500 hero-glow scale-110 shadow-[0_0_40px_rgba(239,68,68,0.5)]" : "bg-primary/20 border-2 border-primary/30"
            )}>
              {isRecording ? <Square className="w-10 h-10 text-white fill-current animate-pulse" /> : <Mic className="w-12 h-12 text-primary" />}
            </div>
            <div className="text-5xl font-mono font-black text-white tracking-widest bg-black/40 px-6 py-2 rounded-xl border border-white/5">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
            {audioUrl && !isRecording && <audio src={audioUrl} controls className="w-full opacity-80" />}
          </div>
          <DialogFooter className="flex-row gap-4">
            {!audioUrl ? (
              <Button 
                className={cn("flex-1 h-16 font-black uppercase tracking-widest text-lg rounded-2xl", isRecording ? "bg-red-600 hover:bg-red-700" : "bg-primary")} 
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? "HENTIKAN" : "MULAI REKAM"}
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1 h-16 font-black rounded-2xl" onClick={() => setAudioUrl(null)}>ULANGI</Button>
                <Button className="flex-1 h-16 bg-primary font-black rounded-2xl" onClick={sendRecording}>KIRIM MISI</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}