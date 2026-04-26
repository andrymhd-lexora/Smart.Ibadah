
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
            description: "Masukkan nama pahlawan Anda untuk pendaftaran.",
          });
          setIsLoadingAction(false);
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Pendaftaran Berhasil",
          description: "Identitas pahlawan Anda telah didaftarkan!",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Akses Diterima",
          description: "Selamat datang kembali di Markas Besar.",
        });
      }

      // Redirect akan ditangani oleh useEffect authStateChanged di dashboard
      const query = `?role=${role}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
      router.push(`/dashboard${query}`);
    } catch (error: any) {
      let message = "Terjadi gangguan pada portal pusat.";
      
      if (error.code === 'auth/invalid-credential') {
        message = "Email atau kata sandi salah. Silakan periksa kembali.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Email ini sudah terdaftar sebagai pahlawan lain.";
      } else if (error.code === 'auth/weak-password') {
        message = "Kata sandi terlalu lemah. Gunakan minimal 6 karakter.";
      } else if (error.code === 'auth/user-not-found') {
        message = "Identitas tidak ditemukan. Silakan daftar akun baru.";
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
        description: "Tidak dapat mengakses portal tamu saat ini.",
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
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <Flame className="w-3 h-3 fill-current" />
              Portal Peradaban Al-Quran
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-[0.9] tracking-tighter">
              Falaah <span className="text-primary italic text-3xl md:text-5xl">v.1.0</span>
              <br />
              Markas <br />
              <span className="text-accent">Pahlawan.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Tempat di mana setiap ayat yang dihafal menjadi kekuatan, dan setiap ibadah menjadi langkah menuju kejayaan.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Sistem Power Level
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Verifikasi Ustadz Epik
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="glass-card shadow-2xl border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-headline uppercase tracking-tighter flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent" />
                {mode === "login" ? "Otorisasi Pahlawan" : "Inisialisasi Pahlawan"}
              </CardTitle>
              <CardDescription>
                {mode === "login" ? "Masuk ke markas operasional Anda" : "Daftarkan identitas baru di sistem RTI"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="santri" className="w-full" onValueChange={(v) => setRole(v as UserRole)}>
                <TabsList className="grid grid-cols-3 w-full mb-6 bg-secondary/50">
                  <TabsTrigger value="santri">Santri</TabsTrigger>
                  <TabsTrigger value="ustadz">Ustadz</TabsTrigger>
                  <TabsTrigger value="wali">Wali</TabsTrigger>
                </TabsList>

                <div className="space-y-4">
                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap Pahlawan</Label>
                      <Input id="name" placeholder="Contoh: Ahmad Faiz" className="bg-secondary/30" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Portal</Label>
                    <Input id="email" type="email" placeholder="pahlawan@falaah.id" className="bg-secondary/30" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Input id="password" type="password" placeholder="••••••••" className="bg-secondary/30" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-emerald-600 text-white font-black h-14 mt-4 uppercase tracking-widest text-lg rounded-2xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50" 
                    onClick={handleAction}
                    disabled={isLoadingAction}
                  >
                    {isLoadingAction ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        {mode === "login" ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                        {mode === "login" ? "MASUK MARKAS" : "DAFTAR SEKARANG"}
                      </>
                    )}
                  </Button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#12141c] px-2 text-muted-foreground">Akses Cepat</span></div>
                  </div>

                  <Button 
                    variant="ghost" 
                    className="w-full text-white/50 hover:text-white hover:bg-white/5" 
                    onClick={() => handleAnonymous(role)}
                    disabled={isLoadingAction}
                  >
                    Masuk Sebagai Tamu
                  </Button>

                  <div className="text-center pt-2">
                    <button 
                      className="text-primary font-bold hover:underline text-sm"
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                    >
                      {mode === "login" ? "Belum punya akun? Daftar di sini" : "Sudah punya akun? Masuk di sini"}
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
