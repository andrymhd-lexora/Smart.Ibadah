
"use client"

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserProfile, UserRole } from "@/lib/types";
import { NavHeader } from "@/components/falaah/nav-header";
import { Footer } from "@/components/falaah/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";

function ProfileContent() {
  const { user: authUser, isUserLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  const roleFromUrl = (searchParams.get('role') as UserRole) || 'santri';
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    school: '',
    class: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Query profil user asli dari Firestore
  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  // Set form data saat profile data berhasil dimuat
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || authUser?.email || '',
        school: profileData.school || '',
        class: profileData.class || ''
      });
    }
  }, [profileData, authUser]);

  const handleSave = () => {
    if (!authUser || !db) return;
    
    setIsSaving(true);
    const docRef = doc(db, 'users', authUser.uid);
    
    updateDocumentNonBlocking(docRef, {
      ...formData,
      updatedAt: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profil Diperbarui",
        description: "Biodata pahlawan Anda telah berhasil disimpan di pangkalan data.",
      });
    }, 800);
  };

  const handleLogout = () => {
    router.push('/');
  };

  if (isUserLoading || isProfileLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader user={profileData || { name: 'Pahlawan', totalExp: 0, streak: 0, role: roleFromUrl } as any} onLogout={handleLogout} />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 md:px-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.push(`/dashboard?role=${roleFromUrl}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Markas
          </Button>
        </div>

        <Card className="glass-card border-white/10 shadow-2xl mb-12">
          <CardHeader className="text-center pb-2">
            <div className="relative mx-auto w-32 h-32 mb-4">
              <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                <AvatarImage src={profileData?.photoUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                  {(formData.name || 'P').charAt(0)}
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
            <CardTitle className="text-3xl font-headline">Identitas Pahlawan</CardTitle>
            <CardDescription>Perbarui biodata Anda untuk catatan Rumah Tahfidz Ikhsan</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Pahlawan</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-secondary/30"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Komunikasi</Label>
                <Input 
                  id="email" 
                  value={formData.email} 
                  disabled
                  className="bg-secondary/10 opacity-70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">Sekolah / Markas Belajar</Label>
                <Input 
                  id="school" 
                  placeholder="Contoh: SMP IT Ikhsan"
                  value={formData.school} 
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                  className="bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Kelas / Skuad</Label>
                <Input 
                  id="class" 
                  placeholder="Contoh: 9A atau Pengajar"
                  value={formData.class} 
                  onChange={(e) => setFormData({...formData, class: e.target.value})}
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
                    Menyimpan Data...
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
      </main>
      <Footer />
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
