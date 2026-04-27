
"use client"

import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { UserProfile } from "@/lib/types";
import { NavHeader } from "@/components/falaah/nav-header";
import { SantriDashboard } from "@/components/falaah/santri-dashboard";
import { UstadzDashboard } from "@/components/falaah/ustadz-dashboard";
import { WaliDashboard } from "@/components/falaah/wali-dashboard";
import { Footer } from "@/components/falaah/footer";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

function DashboardContent() {
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const db = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: profileData, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  // Guard: Redirect ke login jika tidak ada auth user setelah loading selesai
  useEffect(() => {
    if (!isUserLoading && !authUser) {
      router.push('/');
    }
  }, [authUser, isUserLoading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
      toast({ title: "Berhasil Keluar", description: "Sesi pahlawan telah diakhiri." });
    } catch (error) {
      console.error("Gagal keluar:", error);
    }
  };

  if (isUserLoading || (authUser && isProfileLoading)) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Menghubungkan ke Portal Pusat...</p>
      </div>
    </div>
  );

  if (!authUser) return null;

  // Jika data profile belum ditemukan di Firestore
  if (!isProfileLoading && !profileData) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center text-center space-y-6 max-w-md">
          <ShieldAlert className="w-20 h-20 text-accent animate-bounce" />
          <h2 className="text-3xl font-headline font-black uppercase tracking-tighter">Identitas Belum Terverifikasi</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Maaf, kami tidak menemukan profil permanen untuk akun ini di database Markas RTI. Silakan hubungi admin atau daftar ulang.
          </p>
          <Button 
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10"
            onClick={handleLogout}
          >
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  // Kunci peran mutlak dari Database
  const finalUser = profileData as UserProfile;

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex flex-col">
      <NavHeader user={finalUser} onLogout={handleLogout} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:px-8">
        {finalUser.role === 'santri' && <SantriDashboard user={finalUser} />}
        {finalUser.role === 'ustadz' && <UstadzDashboard user={finalUser} />}
        {finalUser.role === 'wali' && <WaliDashboard user={finalUser} />}
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
