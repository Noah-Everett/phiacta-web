"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createToken, listTokens, revokeToken } from "@/lib/api";
import type { TokenListItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Key, Plus, Trash2, Copy, Check, Clock } from "lucide-react";

function RelativeTime({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  let text: string;
  if (diffMin < 1) text = "just now";
  else if (diffMin < 60) text = `${diffMin}m ago`;
  else if (diffHr < 24) text = `${diffHr}h ago`;
  else if (diffDays < 30) text = `${diffDays}d ago`;
  else text = date.toLocaleDateString();

  return <span title={date.toLocaleString()}>{text}</span>;
}

function TokenRow({
  token,
  onRevoke,
}: {
  token: TokenListItem;
  onRevoke: (id: string) => void;
}) {
  const [revoking, setRevoking] = useState(false);
  const isRevoked = token.revoked_at !== null;
  const isExpired =
    token.expires_at !== null && new Date(token.expires_at) <= new Date();
  const isActive = !isRevoked && !isExpired;

  async function handleRevoke() {
    if (!confirm("Revoke this token? This cannot be undone.")) return;
    setRevoking(true);
    try {
      await onRevoke(token.id);
    } finally {
      setRevoking(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Key className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{token.name}</span>
            <code className="text-xs text-muted-foreground">
              pat_{token.key_prefix}...
            </code>
            {isRevoked && (
              <Badge variant="outline" className="text-destructive border-destructive/30">
                Revoked
              </Badge>
            )}
            {isExpired && !isRevoked && (
              <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                Expired
              </Badge>
            )}
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
            <span>
              Created <RelativeTime dateStr={token.created_at} />
            </span>
            {token.last_used_at && (
              <span>
                Last used <RelativeTime dateStr={token.last_used_at} />
              </span>
            )}
            {token.expires_at && !isExpired && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires {new Date(token.expires_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
      {isActive && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={handleRevoke}
          disabled={revoking}
          title="Revoke token"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function TokensPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [tokens, setTokens] = useState<TokenListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form
  const [name, setName] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [creating, setCreating] = useState(false);

  // Newly created token (shown once)
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadTokens = useCallback(async () => {
    try {
      const data = await listTokens();
      setTokens(data);
    } catch {
      setError("Failed to load tokens.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    loadTokens();
  }, [user, authLoading, router, loadTokens]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNewToken(null);
    setCreating(true);
    try {
      const days = expiryDays ? parseInt(expiryDays, 10) : undefined;
      const result = await createToken(name, days);
      setNewToken(result.token);
      setName("");
      setExpiryDays("");
      await loadTokens();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create token."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(tokenId: string) {
    setError("");
    try {
      await revokeToken(tokenId);
      await loadTokens();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to revoke token."
      );
    }
  }

  function handleCopy() {
    if (!newToken) return;
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const activeTokens = tokens.filter((t) => t.revoked_at === null);
  const revokedTokens = tokens.filter((t) => t.revoked_at !== null);

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Personal Access Tokens
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tokens authenticate API requests from scripts, the SDK, and the MCP
          server. Treat them like passwords.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Show-once banner for newly created token */}
      {newToken && (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">
            Token created. Copy it now — you won&apos;t see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-background px-3 py-2 text-sm font-mono break-all border">
              {newToken}
            </code>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Create token form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="token-name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                id="token-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. mcp-server, ci-pipeline"
                maxLength={100}
              />
            </div>
            <div className="w-full sm:w-36 space-y-1.5">
              <label htmlFor="token-expiry" className="text-sm font-medium text-foreground">
                Expires in (days)
              </label>
              <Input
                id="token-expiry"
                type="number"
                min={1}
                max={365}
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                placeholder="Never"
              />
            </div>
            <Button type="submit" disabled={creating || !name.trim()} className="sm:w-auto">
              {creating ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active tokens */}
      <div className="mb-2">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Active tokens ({activeTokens.length})
        </h2>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : activeTokens.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No active tokens.</p>
      ) : (
        <div className="divide-y">
          {activeTokens.map((t) => (
            <TokenRow key={t.id} token={t} onRevoke={handleRevoke} />
          ))}
        </div>
      )}

      {/* Revoked tokens */}
      {revokedTokens.length > 0 && (
        <>
          <Separator className="my-6" />
          <div className="mb-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Revoked tokens ({revokedTokens.length})
            </h2>
          </div>
          <div className="divide-y opacity-60">
            {revokedTokens.map((t) => (
              <TokenRow key={t.id} token={t} onRevoke={handleRevoke} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
