
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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";

export default function LandingPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user: authUser, isUserLoading } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto-redirect jika sudah login
  useEffect(() => {
    if (!isUserLoading && authUser) {
      // Jika sudah login, kita tetap butuh role. Default ke santri jika tidak ada context
      router.push('/dashboard?role=santri');
    }
  }, [authUser, isUserLoading, router]);

  const handleLogin = (role: UserRole) => {
    if (!email && role === 'santri') {
      toast({
        variant: "destructive",
        title: "Nama Diperlukan",
        description: "Masukkan nama atau email pahlawan Anda.",
      });
      return;
    }

    initiateAnonymousSignIn(auth);
    
    toast({
      title: "Proses Masuk",
      description: `Menyiapkan markas pahlawan...`,
    });
    
    const displayName = email ? email.split('@')[0] : "Pahlawan";
    router.push(`/dashboard?role=${role}&name=${encodeURIComponent(displayName)}`);
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
              Memberdayakan Perjalanan Ibadah
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-[0.9] tracking-tighter">
              Falaah <span className="text-primary italic text-3xl md:text-5xl">v.1.0</span>
              <br />
              Pelacak Ibadah <br />
              <span className="text-accent">Pintar.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Gamifikasi progres spiritualmu. Pantau sholat, bacaan Quran, dan hafalan dengan bantuan motivasi berbasis AI.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Sistem EXP
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Progres Peringkat
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Verifikasi Guru
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <Card className="glass-card shadow-2xl border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Aktivasi Pahlawan</CardTitle>
              <CardDescription>Pilih identitas Anda untuk melanjutkan</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="santri" className="w-full">
                <TabsList className="grid grid-cols-3 w-full mb-8 bg-secondary/50">
                  <TabsTrigger value="santri">Santri</TabsTrigger>
                  <TabsTrigger value="ustadz">Ustadz</TabsTrigger>
                  <TabsTrigger value="wali">Wali</TabsTrigger>
                </TabsList>

                <TabsContent value="santri" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-santri">Nama Pahlawan / Email</Label>
                    <Input id="email-santri" placeholder="Contoh: Faiz" className="bg-secondary/30" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-santri">Kata Sandi (Opsional)</Label>
                    <Input id="password-santri" type="password" placeholder="••••••••" className="bg-secondary/30" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground font-bold py-6 mt-4" onClick={() => handleLogin('santri')}>
                    Masuk ke Markas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </TabsContent>

                <TabsContent value="ustadz" className="space-y-4">
                  <div className="space-y-2 text-center py-4">
                    <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Akses Pengajar</h3>
                    <p className="text-sm text-muted-foreground">Gunakan otoritas Anda untuk membimbing para pahlawan muda.</p>
                  </div>
                  <Button className="w-full bg-accent text-accent-foreground font-bold py-6" onClick={() => handleLogin('ustadz')}>
                    Masuk sebagai Ustadz
                    <ShieldCheck className="w-4 h-4 ml-2" />
                  </Button>
                </TabsContent>

                <TabsContent value="wali" className="space-y-4">
                  <div className="space-y-2 text-center py-4">
                    <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Pemantauan Wali</h3>
                    <p className="text-sm text-muted-foreground">Pantau perkembangan spiritual pahlawan kecil Anda.</p>
                  </div>
                  <Button className="w-full bg-secondary text-foreground font-bold py-6" onClick={() => handleLogin('wali')}>
                    Masuk sebagai Wali
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
