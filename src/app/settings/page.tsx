"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  function handleCopyId() {
    navigator.clipboard.writeText(user!.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const memberSince = new Date(user.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">Account</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account information
      </p>

      <Separator className="my-5" />

      <div className="space-y-5">
        <SettingsRow label="Username" value={user.username} />

        <SettingsRow label="Password" value="********">
          <Button variant="outline" size="sm" disabled>
            Change password
          </Button>
        </SettingsRow>

        <SettingsRow label="Member since" value={memberSince} />

        <SettingsRow label="User ID" mono value={user.id}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleCopyId}
            title="Copy user ID"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </SettingsRow>
      </div>

      <Separator className="my-5" />

      <Button variant="outline" size="sm" asChild>
        <Link href={`/users/${user.id}`} className="gap-1.5">
          View your profile
          <ExternalLink className="h-3 w-3" />
        </Link>
      </Button>
    </div>
  );
}

function SettingsRow({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p
          className={`mt-0.5 text-sm text-muted-foreground ${
            mono ? "font-mono text-xs" : ""
          }`}
        >
          {value}
        </p>
      </div>
      {children}
    </div>
  );
}
