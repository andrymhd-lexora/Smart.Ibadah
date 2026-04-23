"use client"

import { useMemo } from "react";
import { getRankByExp } from "@/lib/constants";
import { UserProfile } from "@/lib/types";
import { Flame, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavHeaderProps {
  user: UserProfile;
  onLogout: () => void;
}

export function NavHeader({ user, onLogout }: NavHeaderProps) {
  const rank = useMemo(() => getRankByExp(user.totalExp), [user.totalExp]);

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b bg-background/80 px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <span className="text-xl font-headline font-bold text-primary italic">F</span>
          </div>
          <div>
            <h1 className="text-lg font-headline font-bold leading-none tracking-tight">Falaah v.1.0</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Rumah Tahfidz Ikhsan</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="text-xs font-bold">{user.streak} Days</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full border border-white/10">
            <span className="text-sm">{rank.icon}</span>
            <span className="text-xs font-bold font-headline text-accent uppercase tracking-tighter">{rank.name}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card">
              <DropdownMenuLabel className="font-headline">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout} className="flex items-center gap-2 text-destructive">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
