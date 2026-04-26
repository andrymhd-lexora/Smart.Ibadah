
"use client"

import { useState, useEffect } from "react";
import { UserProfile, IbadahLog } from "@/lib/types";
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
  Link as LinkIcon,
  Loader2,
  ShieldCheck,
  User
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useFirestore, useDoc, useCollection, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { doc, collection, query, where, getDocs } from "firebase/firestore";
import { format } from "date-fns";

interface WaliDashboardProps {
  user: UserProfile;
}

export function WaliDashboard({ user }: WaliDashboardProps) {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const db = useFirestore();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Mendapatkan data Santri pertama yang terhubung (Wali v1.0 hanya dukung 1 anak)
  const firstChildId = user.linkedStudentIds?.[0];

  const childRef = useMemoFirebase(() => {
    if (!db || !firstChildId) return null;
    return doc(db, 'users', firstChildId);
  }, [db, firstChildId]);

  const { data: childProfile, isLoading: isChildLoading } = useDoc<UserProfile>(childRef);

  const childLogsRef = useMemoFirebase(() => {
    if (!db || !firstChildId) return null;
    return doc(db, `users/${firstChildId}/ibadahLogs`, today);
  }, [db, firstChildId, today]);

  const { data: todayLog } = useDoc<IbadahLog>(childLogsRef);

  const handleLink = async () => {
    if (!studentIdInput || !db) return;
    setIsLinking(true);
    
    try {
      // Mencari santri berdasarkan ID Peserta
      const q = query(collection(db, "users"), where("participantId", "==", studentIdInput));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Santri Tidak Ditemukan",
          description: "ID Peserta tidak valid atau pahlawan belum terdaftar.",
        });
      } else {
        const studentDoc = querySnapshot.docs[0];
        const studentData = studentDoc.data() as UserProfile;
        
        if (studentData.role !== 'santri') {
          toast({ variant: "destructive", title: "Gagal", description: "ID tersebut bukan milik seorang Santri." });
        } else {
          // Update data Wali
          const waliRef = doc(db, 'users', user.uid);
          const newList = [...(user.linkedStudentIds || []), studentDoc.id];
          setDocumentNonBlocking(waliRef, { linkedStudentIds: newList }, { merge: true });

          toast({
            title: "Koneksi Berhasil!",
            description: `Anda kini terhubung dengan pahlawan ${studentData.name}.`,
          });
          setStudentIdInput("");
        }
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error", description: "Terjadi gangguan transmisi data." });
    } finally {
      setIsLinking(false);
    }
  };

  if (isChildLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Menghubungkan citra spiritual anak...</p>
    </div>
  );

  if (!firstChildId || !childProfile) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="glass-card border-none bg-card/40 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LinkIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline font-black uppercase tracking-tighter">Hubungkan Santri</CardTitle>
            <CardDescription>Masukkan Nomor Peserta (ID) anak Anda untuk mulai memantau misi harian mereka.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-white/40 ml-1">Nomor Peserta Santri</label>
              <Input 
                placeholder="Contoh: RTI-1234" 
                value={studentIdInput} 
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold focus:border-primary"
              />
            </div>
            <Button 
              className="w-full h-14 bg-primary hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg transition-all" 
              onClick={handleLink}
              disabled={isLinking}
            >
              {isLinking ? <Loader2 className="w-6 h-6 animate-spin" /> : "HUBUNGKAN SEKARANG"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const childRank = getRankByExp(childProfile.totalExp);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className="relative w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Heart className="w-10 h-10 fill-current" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Pemantauan Wali</h2>
            <p className="text-muted-foreground mt-2">Pembaruan real-time misi pahlawan: <span className="text-primary font-black">{childProfile.name}</span></p>
          </div>
        </div>
        <div className="flex gap-4">
          <Badge className="bg-orange-500/20 text-orange-500 border-none px-4 py-2 rounded-xl text-xs font-black uppercase">
            <Flame className="w-4 h-4 mr-2 fill-current" />
            STREAK: {childProfile.streak} HARI
          </Badge>
          <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-4 py-2 rounded-xl text-xs font-black uppercase">
            <ShieldCheck className="w-4 h-4 mr-2" />
            STATUS: AKTIF
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card border-none bg-card/40 shadow-2xl overflow-hidden h-fit">
          <div className="h-24 bg-gradient-to-r from-primary/20 to-accent/20"></div>
          <CardContent className="p-8 text-center space-y-6 -mt-12">
            <div className="relative mx-auto w-32 h-32">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse"></div>
              <div className="relative w-32 h-32 bg-[#0f172a] border-4 border-primary rounded-full flex items-center justify-center text-6xl shadow-2xl">
                {childRank.icon}
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{childRank.name}</h3>
              <p className="text-xs text-muted-foreground font-bold tracking-widest">{childProfile.totalExp.toLocaleString()} POWER LEVEL</p>
            </div>
            
            <div className="pt-6 border-t border-white/5 space-y-4 text-left">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Energi Bulanan</span>
                <span className="text-sm font-bold text-primary">+{(todayLog?.awardedExp || 0)} EXP</span>
              </div>
              <Progress value={Math.min(100, (childProfile.totalExp % 1000) / 10)} className="h-2 bg-black/40" />
            </div>
            
            <Button variant="ghost" className="w-full text-white/50 hover:text-white text-xs uppercase font-black" onClick={() => {
              const waliRef = doc(db, 'users', user.uid);
              setDocumentNonBlocking(waliRef, { linkedStudentIds: [] }, { merge: true });
              toast({ title: "Koneksi Terputus", description: "Anda telah melepaskan tautan dengan santri ini." });
            }}>Putuskan Tautan</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass-card border-none bg-card/40 shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg"><Activity className="w-5 h-5 text-primary" /></div>
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter">Riwayat Misi Hari Ini</CardTitle>
                <CardDescription>Aktivitas spiritual yang berhasil diselesaikan pada {today}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!todayLog || (!todayLog.activities.prayers.length && !todayLog.activities.others.length) ? (
              <div className="py-20 text-center space-y-4">
                <Clock className="w-12 h-12 text-white/10 mx-auto" />
                <p className="text-muted-foreground italic">Pahlawan belum melaporkan misi hari ini.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {todayLog.activities.prayers.map((prayer, i) => (
                  <div key={`prayer-${i}`} className="flex items-center justify-between p-6 hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-white">Misi Sholat: {prayer}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Tercatat pada Sistem Markas</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-none font-black">+50 EXP</Badge>
                  </div>
                ))}
                {todayLog.activities.others.map((task, i) => (
                  <div key={`task-${i}`} className="flex items-center justify-between p-6 hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-white">Misi Khusus: {task}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Target Tercapai</p>
                      </div>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-none font-black">+40 EXP</Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="p-6 bg-black/20 text-center">
               <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Update Terakhir: {todayLog?.updatedAt ? format(new Date(todayLog.updatedAt), 'HH:mm:ss') : '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
