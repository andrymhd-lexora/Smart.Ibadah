"use client"

import { useState } from "react";
import { UserRole, UserProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  BookOpen, 
  Users, 
  ArrowRight,
  Flame,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (role: UserRole) => {
    // Simulated login for demo
    // Save role to localStorage or similar if needed for persistence in real app
    toast({
      title: "Login Successful",
      description: `Welcome back! Redirecting to ${role} dashboard.`,
    });
    router.push(`/dashboard?role=${role}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Hero Section */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <Flame className="w-3 h-3 fill-current" />
              Empowering Religious Journey
            </div>
            <h1 className="text-5xl md:text-7xl font-headline font-bold leading-[0.9] tracking-tighter">
              Falaah <span className="text-primary italic text-3xl md:text-5xl">v.1.0</span>
              <br />
              Smart Ibadah <br />
              <span className="text-accent">Tracker.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Gamify your spiritual progress. Track prayers, Quran reading, and memorization with AI-powered motivation.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              EXP System
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Rank Progression
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Teacher Verified
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div className="w-full max-w-md mx-auto">
          <Card className="glass-card shadow-2xl border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Get Started</CardTitle>
              <CardDescription>Choose your role to continue</CardDescription>
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
                    <Label htmlFor="email-santri">Email Address</Label>
                    <Input id="email-santri" placeholder="faiz@example.com" className="bg-secondary/30" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-santri">Password</Label>
                    <Input id="password-santri" type="password" placeholder="••••••••" className="bg-secondary/30" value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground font-bold py-6 mt-4" onClick={() => handleLogin('santri')}>
                    Login as Santri
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </TabsContent>

                <TabsContent value="ustadz" className="space-y-4">
                  <div className="space-y-2 text-center py-4">
                    <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Instructor Access</h3>
                    <p className="text-sm text-muted-foreground">Enter your credentials to manage the class at Rumah Tahfidz Ikhsan.</p>
                  </div>
                  <Button className="w-full bg-accent text-accent-foreground font-bold py-6" onClick={() => handleLogin('ustadz')}>
                    Login as Ustadz
                    <ShieldCheck className="w-4 h-4 ml-2" />
                  </Button>
                </TabsContent>

                <TabsContent value="wali" className="space-y-4">
                  <div className="space-y-2 text-center py-4">
                    <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-bold">Parental Monitoring</h3>
                    <p className="text-sm text-muted-foreground">Check your child's spiritual progress in real-time.</p>
                  </div>
                  <Button className="w-full bg-secondary text-foreground font-bold py-6" onClick={() => handleLogin('wali')}>
                    Login as Wali / Parent
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our spiritual growth guidelines.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-medium opacity-50">
          Developed for Rumah Tahfidz Ikhsan
        </p>
      </div>
    </main>
  );
}
