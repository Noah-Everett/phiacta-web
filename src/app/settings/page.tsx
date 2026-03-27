"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import {
  User,
  Key,
  Shield,
  ExternalLink,
  LayoutDashboard,
} from "lucide-react";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">
            {getInitials(user.handle)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Handle
              </label>
              <p className="text-sm text-foreground">{user.handle}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Member since
              </label>
              <p className="text-sm text-foreground">{memberSince}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="text-xs text-muted-foreground font-mono">
                {user.id}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Profile editing coming soon.
            </p>
          </div>
        </div>

        {/* Security card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
          </div>
          <Separator className="mb-4" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Personal Access Tokens
                </p>
                <p className="text-xs text-muted-foreground">
                  Manage tokens for API and SDK authentication
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/tokens" className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  Manage tokens
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Links card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">
              Quick Links
            </h2>
          </div>
          <Separator className="mb-4" />
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard" className="flex items-center gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                My Entries
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/users/${user.id}`}
                className="flex items-center gap-1.5"
              >
                <User className="h-3.5 w-3.5" />
                View Public Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
