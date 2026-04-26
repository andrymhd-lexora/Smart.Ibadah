
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
import { Badge } from "@/components/ui/badge";
import { Camera, Save, ArrowLeft, Loader2, Phone, Hash } from "lucide-react";
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
    class: '',
    whatsapp: '',
    participantId: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || authUser?.email || '',
        school: profileData.school || '',
        class: profileData.class || '',
        whatsapp: profileData.whatsapp || '',
        participantId: profileData.participantId || ''
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
        description: "Identitas pahlawan Anda telah diperbarui dalam arsip pusat.",
      });
    }, 800);
  };

  const handleLogout = () => {
    router.push('/');
  };

  if (isUserLoading || isProfileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
    </div>
  );

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader user={profileData || { name: formData.name || 'Pahlawan', totalExp: 0, streak: 0, role: roleFromUrl } as any} onLogout={handleLogout} />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="gap-2 text-muted-foreground hover:text-white transition-colors"
            onClick={() => router.push(`/dashboard?role=${roleFromUrl}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Markas Utama
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Card */}
          <Card className="glass-card border-white/10 shadow-2xl h-fit">
            <CardContent className="p-8 text-center space-y-6">
              <div className="relative mx-auto w-40 h-40">
                <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse"></div>
                <Avatar className="w-40 h-40 border-4 border-primary/30 shadow-2xl relative z-10">
                  <AvatarImage src={profileData?.photoUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-800 text-white text-5xl font-black">
                    {(formData.name || 'P').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-2 right-2 rounded-full bg-accent text-white hover:bg-accent/90 shadow-xl border-4 border-background z-20"
                  onClick={() => toast({ title: "Fitur Foto", description: "Enkripsi foto profil akan tersedia segera." })}
                >
                  <Camera className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-headline font-black text-white">{formData.name}</h2>
                <Badge variant="outline" className="border-primary/30 text-primary uppercase font-black text-[10px] px-4">
                  {roleFromUrl}
                </Badge>
              </div>
              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase">Power Level</p>
                  <p className="text-lg font-black text-accent">{profileData?.totalExp?.toLocaleString() || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase">Misi Aktif</p>
                  <p className="text-lg font-black text-primary">{profileData?.streak || 0} Hari</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="lg:col-span-2 glass-card border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-headline font-black text-white">Identitas Pahlawan</CardTitle>
              <CardDescription>Detail pendaftaran Anda di Rumah Tahfidz Ikhsan</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-xs font-black uppercase text-white/50 tracking-widest">Nama Lengkap</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-12 bg-black/40 border-white/10 rounded-xl text-white font-bold"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="participantId" className="text-xs font-black uppercase text-white/50 tracking-widest">Nomor Peserta (ID)</Label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      id="participantId" 
                      value={formData.participantId} 
                      onChange={(e) => setFormData({...formData, participantId: e.target.value})}
                      className="h-12 pl-12 bg-black/40 border-white/10 rounded-xl text-white font-bold"
                      placeholder="Contoh: RTI-2024-001"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-black uppercase text-white/50 tracking-widest">Email Terdaftar</Label>
                  <Input 
                    id="email" 
                    value={formData.email} 
                    disabled
                    className="h-12 bg-white/5 border-white/5 opacity-50 text-white font-bold cursor-not-allowed"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="whatsapp" className="text-xs font-black uppercase text-white/50 tracking-widest">Nomor WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    <Input 
                      id="whatsapp" 
                      value={formData.whatsapp} 
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="h-12 pl-12 bg-black/40 border-white/10 rounded-xl text-white font-bold"
                      placeholder="Contoh: 081234567890"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="school" className="text-xs font-black uppercase text-white/50 tracking-widest">Asal Sekolah / Markas</Label>
                  <Input 
                    id="school" 
                    placeholder="Contoh: SMP IT Ikhsan"
                    value={formData.school} 
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    className="h-12 bg-black/40 border-white/10 rounded-xl text-white font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="class" className="text-xs font-black uppercase text-white/50 tracking-widest">Kelas / Skuad</Label>
                  <Input 
                    id="class" 
                    placeholder="Contoh: 9A atau Pengajar"
                    value={formData.class} 
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    className="h-12 bg-black/40 border-white/10 rounded-xl text-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <Button 
                  className="w-full bg-primary hover:bg-emerald-600 text-white font-black py-8 rounded-2xl gap-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      MENGAMANKAN DATA...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      PERBARUI IDENTITAS PAHLAWAN
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
