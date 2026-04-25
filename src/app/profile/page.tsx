"use client"

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserProfile, UserRole } from "@/lib/types";
import { NavHeader } from "@/components/falaah/nav-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MOCK_USERS: Record<UserRole, UserProfile> = {
  santri: {
    uid: 'current-user-1',
    name: 'Ahmad Faiz',
    email: 'faiz@example.com',
    role: 'santri',
    totalExp: 32550,
    streak: 15,
    school: 'SMP IT Ikhsanul Amal',
    class: '9A'
  },
  ustadz: {
    uid: 'current-user-2',
    name: 'Ustadz Mansyur',
    email: 'mansyur@example.com',
    role: 'ustadz',
    totalExp: 0,
    streak: 0,
    school: 'Rumah Tahfidz Ikhsan',
    class: 'Pengajar Tahfidz'
  },
  wali: {
    uid: 'current-user-3',
    name: 'Pak Budi',
    email: 'budi@example.com',
    role: 'wali',
    totalExp: 0,
    streak: 0,
    school: '-',
    class: 'Orang Tua'
  }
};

function ProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = (searchParams.get('role') as UserRole) || 'santri';
  
  const [user, setUser] = useState<UserProfile>(MOCK_USERS[role]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulasi penyimpanan data
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profil Diperbarui",
        description: "Biodata Anda telah berhasil disimpan.",
      });
    }, 1000);
  };

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader user={user} onLogout={handleLogout} />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 md:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.push(`/dashboard?role=${role}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Button>
        </div>

        <Card className="glass-card border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="relative mx-auto w-32 h-32 mb-4">
              <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                <AvatarImage src={user.photoUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                className="absolute bottom-0 right-0 rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg border-2 border-background"
                onClick={() => toast({ title: "Fitur Foto", description: "Fitur unggah foto akan tersedia di versi pro." })}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="text-3xl font-headline">Profil & Biodata</CardTitle>
            <CardDescription>Lengkapi data diri Anda untuk keperluan administrasi</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input 
                  id="name" 
                  value={user.name} 
                  onChange={(e) => setUser({...user, name: e.target.value})}
                  className="bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user.email} 
                  disabled
                  className="bg-secondary/10 opacity-70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">Sekolah / Instansi</Label>
                <Input 
                  id="school" 
                  placeholder="Contoh: SMP IT Ikhsan"
                  value={user.school} 
                  onChange={(e) => setUser({...user, school: e.target.value})}
                  className="bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Kelas / Jabatan</Label>
                <Input 
                  id="class" 
                  placeholder="Contoh: 9A atau Pengajar"
                  value={user.class} 
                  onChange={(e) => setUser({...user, class: e.target.value})}
                  className="bg-secondary/30"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <Button 
                className="w-full bg-primary text-primary-foreground font-bold py-6 gap-2"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center pt-8">
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50">
            Rumah Tahfidz Ikhsan — Falaah v.1.0
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
