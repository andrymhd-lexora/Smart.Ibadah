
"use client"

import { useState, useEffect } from "react";
import { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  BookOpen, 
  Users, 
  ArrowRight,
  Flame,
  CheckCircle2,
  Loader2,
  UserPlus,
  LogIn,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from "firebase/auth";

export default function LandingPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user: authUser, isUserLoading } = useUser();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("santri");
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  useEffect(() => {
    if (!isUserLoading && authUser) {
      router.push('/dashboard');
    }
  }, [authUser, isUserLoading, router]);

  const handleAction = async () => {
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Data Tidak Lengkap",
        description: "Email dan kata sandi wajib diisi.",
      });
      return;
    }

    setIsLoadingAction(true);
    try {
      if (mode === "register") {
        if (!name) {
          toast({
            variant: "destructive",
            title: "Nama Diperlukan",
            description: "Masukkan nama Anda untuk pendaftaran pahlawan baru.",
          });
          setIsLoadingAction(false);
          return;
        }
        // Proses Pendaftaran
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Inisialisasi Berhasil",
          description: "Identitas pahlawan Anda sedang didaftarkan ke sistem.",
        });
      } else {
        // Proses Login
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Akses Diterima",
          description: "Membuka pintu Markas Besar...",
        });
      }

      // Kirim parameter role sebagai hint untuk inisialisasi awal di dashboard
      const query = `?role=${role}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
      router.push(`/dashboard${query}`);
    } catch (error: any) {
      let message = "Terjadi gangguan pada portal pusat.";
      
      if (error.code === 'auth/invalid-credential') {
        message = "Email atau kata sandi salah. Silakan periksa kembali.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Email ini sudah terdaftar. Silakan pilih mode MASUK.";
        setMode("login");
      } else if (error.code === 'auth/weak-password') {
        message = "Kata sandi terlalu lemah. Minimal 6 karakter.";
      }

      toast({
        variant: "destructive",
        title: "Otorisasi Gagal",
        description: message,
      });
      setIsLoadingAction(false);
    }
  };

  const handleAnonymous = async (selectedRole: UserRole) => {
    setIsLoadingAction(true);
    try {
      await signInAnonymously(auth);
      router.push(`/dashboard?role=${selectedRole}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Masuk Tamu",
        description: "Portal tamu sedang dalam pemeliharaan.",
      });
      setIsLoadingAction(false);
    }
  };

  if (isUserLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#0a0a0c]">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -z-10 animate-pulse [animation-delay:1s]"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em]">
              <Flame className="w-3 h-3 fill-current" />
              Portal Peradaban Al-Quran
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-black leading-[0.9] tracking-tighter text-white">
              Falaah <span className="text-primary italic text-3xl md:text-5xl">v.1.0</span>
              <br />
              Markas <br />
              <span className="text-accent">Pahlawan.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Jelajahi setiap ayat, kumpulkan EXP spiritual, dan jadilah pahlawan peradaban yang beradab dan taat.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Sistem Level Heroik
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Database Firestore Terenkripsi
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="glass-card shadow-2xl border-white/10 bg-card/40 backdrop-blur-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-headline uppercase tracking-tighter flex items-center justify-center gap-2 text-white">
                <Sparkles className="w-6 h-6 text-accent" />
                {mode === "login" ? "Otorisasi Masuk" : "Daftar Pahlawan Baru"}
              </CardTitle>
              <CardDescription className="font-medium">
                {mode === "login" ? "Selamat datang kembali, Pahlawan!" : "Mulai perjalanan spiritual epik Anda di sini."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="santri" className="w-full" onValueChange={(v) => setRole(v as UserRole)}>
                <TabsList className="grid grid-cols-3 w-full mb-6 bg-secondary/50 p-1 rounded-xl">
                  <TabsTrigger value="santri" className="rounded-lg font-black uppercase text-[10px] tracking-widest">Santri</TabsTrigger>
                  <TabsTrigger value="ustadz" className="rounded-lg font-black uppercase text-[10px] tracking-widest">Ustadz</TabsTrigger>
                  <TabsTrigger value="wali" className="rounded-lg font-black uppercase text-[10px] tracking-widest">Wali</TabsTrigger>
                </TabsList>

                <div className="space-y-4">
                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-black uppercase text-white/50 ml-1">Nama Lengkap</Label>
                      <Input id="name" placeholder="Contoh: Ahmad Faiz" className="h-12 bg-secondary/30 border-white/5 focus:border-primary" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-black uppercase text-white/50 ml-1">Email Markas</Label>
                    <Input id="email" type="email" placeholder="pahlawan@falaah.id" className="h-12 bg-secondary/30 border-white/5 focus:border-primary" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[10px] font-black uppercase text-white/50 ml-1">Kode Akses (Password)</Label>
                    <Input id="password" type="password" placeholder="••••••••" className="h-12 bg-secondary/30 border-white/5 focus:border-primary" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-emerald-600 text-white font-black h-14 mt-6 uppercase tracking-widest text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50" 
                    onClick={handleAction}
                    disabled={isLoadingAction}
                  >
                    {isLoadingAction ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                        {mode === "login" ? "MASUK MARKAS" : "GABUNG SEKARANG"}
                      </>
                    )}
                  </Button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-black"><span className="bg-[#12141c] px-2 text-muted-foreground tracking-[0.3em]">Mode Tamu</span></div>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full text-white/30 hover:text-white hover:bg-white/5 rounded-xl h-12 uppercase font-black text-[10px] tracking-widest" 
                    onClick={() => handleAnonymous(role)}
                    disabled={isLoadingAction}
                  >
                    Masuk Sebagai Tamu Sementara
                  </Button>

                  <div className="text-center pt-4">
                    <button 
                      className="text-primary font-black hover:underline text-xs uppercase tracking-widest"
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                    >
                      {mode === "login" ? "Belum punya identitas? Daftar" : "Sudah terdaftar? Masuk Markas"}
                    </button>
                  </div>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
