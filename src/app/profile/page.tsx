
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
import { Camera, Save, ArrowLeft, Loader2, Phone, Hash, Mail, Sparkles, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";

function ProfileContent() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    school: '',
    class: '',
    whatsapp: '',
    participantId: '',
    photoUrl: ''
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
        participantId: profileData.participantId || '',
        photoUrl: profileData.photoUrl || ''
      });
    }
  }, [profileData, authUser]);

  const handleSave = () => {
    if (!authUser || !db || !profileData) return;
    
    setIsSaving(true);
    const docRef = doc(db, 'users', authUser.uid);
    
    // Role TIDAK BOLEH diubah di sini
    const updatedData = {
      ...formData,
      uid: authUser.uid,
      role: profileData.role, // Memastikan role tetap sesuai database
      updatedAt: new Date().toISOString()
    };

    setDocumentNonBlocking(docRef, updatedData, { merge: true });

    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Identitas Disinkronkan",
        description: "Data pahlawan Anda telah berhasil diamankan di database pusat.",
      });
    }, 1000);
  };

  const handlePhotoUpload = () => {
    if (!authUser || !db) return;
    const mockPhotoUrl = `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/400/400`;
    setFormData(prev => ({ ...prev, photoUrl: mockPhotoUrl }));
    
    const docRef = doc(db, 'users', authUser.uid);
    setDocumentNonBlocking(docRef, {
      photoUrl: mockPhotoUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({
      title: "Citra Diperbarui",
      description: "Menghubungkan citra baru ke profil spiritual Anda...",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  if (isUserLoading || (authUser && isProfileLoading)) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Mengakses data pahlawan...</p>
      </div>
    </div>
  );

  if (!authUser) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavHeader user={(profileData || { ...formData, role: 'santri', totalExp: 0, streak: 0 }) as any} onLogout={handleLogout} />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="gap-2 text-muted-foreground hover:text-white transition-colors"
            onClick={() => router.push(`/dashboard`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Markas
          </Button>
          <div className="flex items-center gap-2 text-accent animate-pulse">
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Editor Pahlawan Aktif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="glass-card border-none bg-card/40 shadow-2xl h-fit overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary/30 to-accent/30"></div>
            <CardContent className="p-8 text-center space-y-6 -mt-16">
              <div className="relative mx-auto w-40 h-40 group">
                <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse group-hover:bg-primary/40 transition-all"></div>
                <Avatar className="w-40 h-40 border-4 border-background shadow-2xl relative z-10 transition-transform group-hover:scale-105 duration-500">
                  <AvatarImage src={formData.photoUrl} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-800 text-white text-5xl font-black">
                    {(formData.name || 'P').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-2 right-2 rounded-full bg-accent text-white hover:bg-accent/90 shadow-xl border-4 border-background z-20 hover:scale-110 transition-all"
                  onClick={handlePhotoUpload}
                >
                  <Camera className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-headline font-black text-white">{formData.name || 'Pahlawan'}</h2>
                <Badge variant="secondary" className="bg-primary/20 text-primary uppercase font-black text-[10px] px-4 py-1 flex items-center gap-1 mx-auto w-fit">
                  <Shield className="w-3 h-3" />
                  {profileData?.role || 'SANTRI'}
                </Badge>
              </div>
              <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase">Power Level</p>
                  <p className="text-xl font-black text-accent">{profileData?.totalExp?.toLocaleString() || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase">Misi Aktif</p>
                  <p className="text-xl font-black text-primary">{profileData?.streak || 0} Hari</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 glass-card border-none bg-card/40 shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-8">
              <CardTitle className="text-3xl font-headline font-black text-white tracking-tighter uppercase">Identitas Pahlawan</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Sesuaikan detail biodata Anda di Rumah Tahfidz Ikhsan</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Nama Lengkap</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold focus:border-primary focus:ring-primary/20 transition-all text-lg"
                    placeholder="Masukkan nama pahlawan"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="participantId" className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Nomor Peserta (ID)</Label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <Input 
                      id="participantId" 
                      value={formData.participantId} 
                      onChange={(e) => setFormData({...formData, participantId: e.target.value})}
                      className="h-14 pl-12 bg-black/40 border-white/10 rounded-2xl text-white font-bold focus:border-primary transition-all text-lg"
                      placeholder="Contoh: RTI-1234"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Email Terdaftar</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <Input 
                      id="email" 
                      value={formData.email} 
                      disabled
                      className="h-14 pl-12 bg-white/5 border-white/5 opacity-50 text-white/40 font-bold cursor-not-allowed text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="whatsapp" className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Nomor WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <Input 
                      id="whatsapp" 
                      value={formData.whatsapp} 
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                      className="h-14 pl-12 bg-black/40 border-white/10 rounded-2xl text-white font-bold focus:border-primary transition-all text-lg"
                      placeholder="Contoh: 0812..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="school" className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Asal Sekolah</Label>
                  <Input 
                    id="school" 
                    placeholder="Contoh: SMP IT Ikhsan"
                    value={formData.school} 
                    onChange={(e) => setFormData({...formData, school: e.target.value})}
                    className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="class" className="text-xs font-black uppercase text-white/50 tracking-widest ml-1">Kelas / Skuad</Label>
                  <Input 
                    id="class" 
                    placeholder="Contoh: 9A"
                    value={formData.class} 
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold text-lg"
                  />
                </div>
              </div>

              <div className="pt-10 border-t border-white/5">
                <Button 
                  className="w-full bg-primary hover:bg-emerald-600 text-white font-black py-8 rounded-[2rem] gap-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all text-xl uppercase"
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
                      <Save className="w-8 h-8" />
                      SIMPAN IDENTITAS
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
