"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function NavbarAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-8 w-20" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/users/${user.id}`}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-[10px]">
              {getInitials(user.username)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-foreground sm:block">
            {user.username}
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          asChild
          title="Settings"
        >
          <Link href="/settings">
            <Settings className="h-3.5 w-3.5" />
          </Link>
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
