
"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense, useMemo } from "react";
import { UserRole, UserProfile } from "@/lib/types";
import { NavHeader } from "@/components/falaah/nav-header";
import { SantriDashboard } from "@/components/falaah/santri-dashboard";
import { UstadzDashboard } from "@/components/falaah/ustadz-dashboard";
import { WaliDashboard } from "@/components/falaah/wali-dashboard";
import { Footer } from "@/components/falaah/footer";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

function DashboardContent() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useFirestore();
  
  // Hint dari pendaftaran (hanya digunakan jika user belum ada di DB)
  const roleHint = searchParams.get('role') as UserRole;
  const nameHint = searchParams.get('name');

  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  // Guard: Redirect ke login jika tidak ada auth user
  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.push('/');
    }
  }, [authUser, isUserLoading, router]);

  // Inisialisasi Profil Baru ke Firestore (Hanya sekali saat daftar)
  useEffect(() => {
    if (authUser && !isProfileLoading && !profileData && db && roleHint) {
      const newUser: UserProfile = {
        uid: authUser.uid,
        name: nameHint ? decodeURIComponent(nameHint) : (authUser.displayName || `Pahlawan ${authUser.uid.slice(0, 4)}`),
        email: authUser.email || '',
        role: roleHint, // Peran dikunci di sini
        totalExp: 0,
        streak: 1,
        whatsapp: '',
        participantId: `RTI-${Math.floor(1000 + Math.random() * 9000)}`,
        linkedStudentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = doc(db, 'users', authUser.uid);
      setDocumentNonBlocking(docRef, newUser, { merge: true });
      
      toast({
        title: "Pahlawan Terdaftar",
        description: `Selamat datang di Markas Besar, ${newUser.name}!`,
      });
    }
  }, [authUser, isProfileLoading, profileData, db, roleHint, nameHint]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
      toast({ title: "Berhasil Keluar", description: "Sesi pahlawan telah diakhiri." });
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  if (isUserLoading || isProfileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Menghubungkan ke Portal Pusat...</p>
      </div>
    </div>
  );

  if (!authUser) return null;

  /**
   * SUMBER KEBENARAN MUTLAK: Peran dari Database (profileData).
   * User tidak bisa pindah jenis dashboard secara manual.
   */
  const finalRole: UserRole = profileData?.role || roleHint || 'santri';

  const finalUser: UserProfile = {
    uid: authUser.uid,
    name: profileData?.name || (nameHint ? decodeURIComponent(nameHint!) : (authUser.displayName || 'Pahlawan')),
    email: profileData?.email || authUser.email || '',
    role: finalRole,
    totalExp: profileData?.totalExp || 0,
    streak: profileData?.streak || 1,
    whatsapp: profileData?.whatsapp || '',
    participantId: profileData?.participantId || '',
    linkedStudentIds: profileData?.linkedStudentIds || [],
    photoUrl: profileData?.photoUrl || '',
    school: profileData?.school || '',
    class: profileData?.class || '',
  } as UserProfile;

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col">
      <NavHeader user={finalUser} onLogout={handleLogout} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:px-8">
        {profileData ? (
          <>
            {finalRole === 'santri' && <SantriDashboard user={finalUser} />}
            {finalRole === 'ustadz' && <UstadzDashboard user={finalUser} />}
            {finalRole === 'wali' && <WaliDashboard user={finalUser} />}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <ShieldAlert className="w-16 h-16 text-accent animate-bounce" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Identitas Belum Terverifikasi</h2>
            <p className="text-muted-foreground max-w-sm text-sm">
              Sistem sedang memproses sinkronisasi peran pahlawan Anda. Jika pesan ini tidak hilang, silakan masuk ulang.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')} 
              className="mt-6 border-white/10 rounded-xl hover:bg-white/5"
            >
              Kembali ke Portal Login
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
