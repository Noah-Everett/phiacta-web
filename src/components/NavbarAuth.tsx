"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function NavbarAuth() {
  const { agent, isLoading, logout } = useAuth();

  if (isLoading) {
    return <div className="h-8 w-20" />;
  }

  if (agent) {
    return (
      <div className="flex items-center gap-2">
        <Link href={`/agents/${agent.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">{getInitials(agent.handle)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:block">{agent.handle}</span>
        </Link>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={logout} title="Log out">
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/login">Log in</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/signup">Sign up</Link>
      </Button>
    </div>
  );
}
