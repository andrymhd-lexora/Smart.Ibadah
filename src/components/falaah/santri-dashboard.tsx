"use client"

import { useState, useEffect } from "react";
import { UserProfile, IbadahLog } from "@/lib/types";
import { 
  getRankByExp, 
  getNextRank, 
  PRAYERS_WAJIB, 
  PRAYERS_SUNNAH, 
  DAILY_IBADAH, 
  EXP_VALUES 
} from "@/lib/constants";
import { 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  History, 
  Trophy,
  BrainCircuit,
  Volume2,
  Send,
  ScrollText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { getPersonalizedMotivation } from "@/ai/flows/personalized-motivation-ai";

interface SantriDashboardProps {
  user: UserProfile;
  initialLog: IbadahLog;
}

export function SantriDashboard({ user, initialLog }: SantriDashboardProps) {
  const [log, setLog] = useState<IbadahLog>(initialLog);
  const [motivation, setMotivation] = useState<string>("");
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  const currentRank = getRankByExp(user.totalExp);
  const nextRank = getNextRank(user.totalExp);
  const expProgress = nextRank ? ((user.totalExp - currentRank.minExp) / (nextRank.minExp - currentRank.minExp)) * 100 : 100;
  const expNeeded = nextRank ? nextRank.minExp - user.totalExp : 0;

  useEffect(() => {
    async function fetchMotivation() {
      setLoadingMotivation(true);
      try {
        const result = await getPersonalizedMotivation({
          name: user.name,
          currentExp: user.totalExp,
          expNeededForNextRank: expNeeded,
          nextRankName: nextRank?.name || "Max Rank",
          suggestedActivity: "Tahajjud prayer"
        });
        setMotivation(result.message);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMotivation(false);
      }
    }
    fetchMotivation();
  }, [user.totalExp, expNeeded, nextRank?.name, user.name]);

  const toggleActivity = (type: keyof IbadahLog['activities'], item: string) => {
    setLog(prev => {
      const activities = { ...prev.activities };
      if (Array.isArray(activities[type])) {
        const list = activities[type] as string[];
        if (list.includes(item)) {
          activities[type] = list.filter(i => i !== item);
        } else {
          activities[type] = [...list, item];
        }
      } else if (typeof activities[type] === 'boolean') {
        (activities[type] as any) = !activities[type];
      }
      return { ...prev, activities };
    });
  };

  const handleSave = () => {
    toast({
      title: "Log Saved",
      description: "Your Ibadah progress has been successfully recorded!",
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Rank Progress Header */}
      <Card className="glass-card overflow-hidden border-none relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-destructive"></div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-headline flex items-center gap-2">
                <span className="text-3xl">{currentRank.icon}</span>
                {currentRank.name} Rank
              </CardTitle>
              <CardDescription className="text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3 h-3 text-accent" />
                {user.totalExp.toLocaleString()} Total EXP
              </CardDescription>
            </div>
            <div className="text-right">
              {nextRank ? (
                <p className="text-xs font-medium text-accent uppercase tracking-wider">
                  {expNeeded.toLocaleString()} EXP to {nextRank.name}
                </p>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">MAX RANK</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={expProgress} className="h-3 bg-secondary" />
          
          {/* AI Insight Box */}
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-start">
            <div className="bg-primary/20 p-2 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm italic leading-relaxed text-foreground/90">
                {loadingMotivation ? "Asking Ustadz AI for encouragement..." : motivation}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Tracker */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Daily Tracker
            </CardTitle>
            <CardDescription>Check your daily prayers and activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Sholat Wajib */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sholat Wajib</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {PRAYERS_WAJIB.map(prayer => (
                  <label 
                    key={prayer} 
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      log.activities.prayers.includes(prayer) 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-secondary/30 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <Checkbox 
                      className="hidden" 
                      checked={log.activities.prayers.includes(prayer)}
                      onCheckedChange={() => toggleActivity('prayers', prayer)}
                    />
                    <span className="text-xs font-bold">{prayer}</span>
                    <span className="text-[10px] opacity-60 mt-1">+{EXP_VALUES.SHOLAT_WAJIB} EXP</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sunnah & Activities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Sunnah & Other</h4>
                <div className="space-y-2">
                  {[...PRAYERS_SUNNAH, ...DAILY_IBADAH].map(item => (
                    <div key={item} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          id={item} 
                          checked={log.activities.prayers.includes(item) || log.activities.others.includes(item)}
                          onCheckedChange={() => {
                            if (PRAYERS_SUNNAH.includes(item)) toggleActivity('prayers', item);
                            else toggleActivity('others', item);
                          }}
                        />
                        <Label htmlFor={item} className="text-sm font-medium">{item}</Label>
                      </div>
                      <Badge variant="secondary" className="text-[10px] bg-white/5 border-none">
                        +{PRAYERS_SUNNAH.includes(item) ? EXP_VALUES.SHOLAT_SUNNAH : EXP_VALUES.DAILY_ACTIVITY} EXP
                      </Badge>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-white/5">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="dzikir" 
                        checked={log.activities.dzikir}
                        onCheckedChange={() => setLog(p => ({...p, activities: {...p.activities, dzikir: !p.activities.dzikir}}))}
                      />
                      <Label htmlFor="dzikir" className="text-sm font-medium">Dzikir Pagi & Petang</Label>
                    </div>
                    <Badge variant="secondary" className="text-[10px] bg-white/5 border-none">+{EXP_VALUES.DZIKIR} EXP</Badge>
                  </div>
                </div>
              </div>

              {/* Murottal Tracker */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Audio & Focus</h4>
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-4">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-accent" />
                    <span className="text-sm font-bold">Murottal Playtime</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Minutes listening today</Label>
                      <Input 
                        type="number" 
                        className="bg-background/50" 
                        placeholder="e.g. 30"
                        value={log.activities.murottalMinutes || ''}
                        onChange={(e) => setLog(p => ({...p, activities: {...p.activities, murottalMinutes: parseInt(e.target.value) || 0}}))}
                      />
                    </div>
                    <div className="pb-1 text-xs text-muted-foreground">mins</div>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">Tip: Listening to Murottal helps your memory and focus.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quran Section */}
        <div className="space-y-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Quran Journal
              </CardTitle>
              <CardDescription>Track your Tilawah & Memorization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Tilawah Progress</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Pages read" 
                    className="bg-secondary/30"
                    value={log.activities.quranPages || ''}
                    onChange={(e) => setLog(p => ({...p, activities: {...p.activities, quranPages: parseInt(e.target.value) || 0}}))}
                  />
                  <div className="flex items-center justify-center px-4 bg-primary/10 rounded-md border border-primary/20">
                    <span className="text-xs font-bold text-primary">+{log.activities.quranPages * EXP_VALUES.QURAN_PAGE} EXP</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Setoran Hafalan</Label>
                  {log.isVerified && <Badge className="bg-primary/20 text-primary border-primary/20">Verified</Badge>}
                  {log.isRevised && <Badge className="bg-destructive/20 text-destructive border-destructive/20">Needs Revision</Badge>}
                </div>
                <Textarea 
                  placeholder="Paste verses or type your recent memorization..."
                  className="min-h-[120px] bg-secondary/30 text-sm leading-relaxed"
                  value={log.activities.hafalanText}
                  onChange={(e) => setLog(p => ({...p, activities: {...p.activities, hafalanText: e.target.value}}))}
                />
                <p className="text-[10px] text-muted-foreground">Your Ustadz will verify this for extra EXP bonus.</p>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6" onClick={handleSave}>
                <Send className="w-4 h-4 mr-2" />
                Submit Daily Log
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                Recent History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                    <span className="text-muted-foreground">May {10-i}, 2024</span>
                    <span className="font-bold text-primary">+450 EXP</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="text-center pt-8">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-50">
          Developed for Rumah Tahfidz Ikhsan
        </p>
      </footer>
    </div>
  );
}
