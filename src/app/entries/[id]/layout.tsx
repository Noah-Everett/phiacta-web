"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { VisibilityBadge } from "@/components/EntryBadges";
import { getInitials } from "@/lib/utils";
import {
  ChevronRight,
  CircleDot,
  GitBranch,
  History,
  FileCode2,
  Link2,
  Activity,
  Tag,
  Pencil,
  Check,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { EntryProvider, useEntryContext } from "./entry-context";
import MarkdownContent from "@/components/MarkdownContent";

const VALID_TABS = [
  "content",
  "issues",
  "edits",
  "history",
  "files",
  "references",
  "activity",
] as const;

function EntryTabBar() {
  const { resolvedId, issues, edits, entry } = useEntryContext();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getActiveTab = (): string => {
    const entryPrefix = `/entries/${resolvedId}`;
    const subPath = pathname.slice(entryPrefix.length);
    if (subPath.startsWith("/files")) return "files";
    if (subPath.startsWith("/edits")) return "edits";
    if (subPath.startsWith("/issues")) return "issues";
    if (subPath.startsWith("/history")) return "history";
    const tab = searchParams.get("tab");
    if (tab && (VALID_TABS as readonly string[]).includes(tab)) return tab;
    return "content";
  };

  const activeTab = getActiveTab();

  const tabs: {
    value: string;
    label: string;
    href: string;
    icon?: typeof CircleDot;
    count?: number;
  }[] = [
    { value: "content", label: "Content", href: `/entries/${resolvedId}` },
    {
      value: "issues",
      label: "Issues",
      href: `/entries/${resolvedId}?tab=issues`,
      icon: CircleDot,
      count: issues.filter((i) => i.state === "open").length,
    },
    {
      value: "edits",
      label: "Edits",
      href: `/entries/${resolvedId}?tab=edits`,
      icon: GitBranch,
      count: edits.filter((e) => e.state === "open").length,
    },
    {
      value: "history",
      label: "History",
      href: `/entries/${resolvedId}?tab=history`,
      icon: History,
    },
    {
      value: "files",
      label: "Files",
      href: `/entries/${resolvedId}?tab=files`,
      icon: FileCode2,
    },
    {
      value: "references",
      label: "References",
      href: `/entries/${resolvedId}?tab=references`,
      icon: Link2,
      count: entry?.references?.length || 0,
    },
    {
      value: "activity",
      label: "Activity",
      href: `/entries/${resolvedId}?tab=activity`,
      icon: Activity,
    },
  ];

  return (
    <nav className="mb-4 flex w-full flex-wrap items-center gap-1 rounded-lg bg-muted p-[3px]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <Badge
                variant="secondary"
                className="ml-0.5 text-xs py-0 px-1.5"
              >
                {tab.count}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function EntryHeader() {
  const {
    entry,
    isOwner,
    editing,
    saving,
    saveError,
    enterEditMode,
    exitEditMode,
    handleSaveAll,
    metaTitle,
    setMetaTitle,
    metaSummary,
    setMetaSummary,
  } = useEntryContext();
  if (!entry) return null;

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4 mb-2">
        {editing && isOwner ? (
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Title"
            className="text-2xl font-bold h-auto py-1.5"
          />
        ) : (
          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {entry.title || "Untitled"}
          </h1>
        )}

        <div className="flex shrink-0 items-center gap-1.5">
          {isOwner && !editing && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={enterEditMode}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          {isOwner && editing && (
            <>
              <Button
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleSaveAll}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={exitEditMode}
                disabled={saving}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {saveError && (
        <p className="mb-2 text-xs text-destructive">{saveError}</p>
      )}

      {editing && isOwner ? (
        <textarea
          value={metaSummary}
          onChange={(e) => setMetaSummary(e.target.value)}
          placeholder="Summary (optional)"
          rows={2}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y mb-4"
        />
      ) : entry.summary ? (
        <MarkdownContent
          content={entry.summary}
          className="mb-4 text-sm text-muted-foreground [&_p]:text-justify"
        />
      ) : null}
    </div>
  );
}

function EntrySidebar() {
  const {
    entry,
    author,
    isOwner,
    editing,
    metaType,
    setMetaType,
    metaVisibility,
    setMetaVisibility,
    editTags,
    newTagInput,
    setNewTagInput,
    addTag,
    removeTag,
  } = useEntryContext();
  if (!entry) return null;

  return (
    <div className="space-y-4">
      {author && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Author
          </h3>
          <Link
            href={`/users/${author.id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-9 w-9">
              <AvatarFallback>{getInitials(author.username)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {author.username}
              </p>
            </div>
          </Link>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            Joined{" "}
            {new Date(author.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Metadata
        </h3>
        <dl className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground shrink-0">Type</dt>
            <dd className="min-w-0">
              {editing && isOwner ? (
                <Input
                  value={metaType}
                  onChange={(e) => setMetaType(e.target.value)}
                  placeholder="e.g. paper, note"
                  className="h-7 w-32 text-xs"
                />
              ) : (
                <span className="font-medium text-foreground capitalize">
                  {entry.entry_type || "—"}
                </span>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground shrink-0">Visibility</dt>
            <dd>
              {editing && isOwner ? (
                <Select
                  value={metaVisibility}
                  onValueChange={(v) =>
                    setMetaVisibility(v as "public" | "private")
                  }
                >
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <VisibilityBadge visibility={entry.visibility} />
              )}
            </dd>
          </div>
          {[
            {
              label: "Published",
              value: new Date(entry.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            },
            {
              label: "Last updated",
              value: new Date(entry.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium text-foreground capitalize">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Tags — always shown when editing (to add/remove), shown only if non-empty otherwise */}
      {(editing && isOwner) || (entry.tags && entry.tags.length > 0) ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Tag className="mr-1.5 inline h-3 w-3" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(editing && isOwner ? editTags : entry.tags ?? []).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs gap-1 pr-1">
                {t}
                {editing && isOwner && (
                  <button
                    onClick={() => removeTag(t)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {editing && isOwner && (
              <div className="flex items-center gap-1">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add tag…"
                  className="text-xs h-7 w-24"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={addTag}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EntryLayoutContent({ children }: { children: ReactNode }) {
  const { entry, loading, error, notFound } = useEntryContext();

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-5 flex items-center gap-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <Skeleton className="h-10 w-full rounded-lg mb-4" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    const is404 = notFound || !entry;
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          {is404 ? "Entry not found" : "Something went wrong"}
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          {is404
            ? "This entry does not exist or has been removed."
            : error || "An unexpected error occurred."}
        </p>
        <Button asChild variant="outline">
          <Link href="/explore">Browse entries</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href="/explore"
          className="hover:text-foreground transition-colors"
        >
          Explore
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/entries/${entry.id}`}
          className="hover:text-foreground transition-colors truncate max-w-[300px]"
        >
          {entry.title || "Untitled"}
        </Link>
      </nav>

      {/* Entry header */}
      <EntryHeader />

      {/* Grid: main content + sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {/* Tab bar — only spans main column */}
          <EntryTabBar />

          {/* Page content */}
          {children}
        </div>

        {/* Sidebar */}
        <EntrySidebar />
      </div>
    </div>
  );
}

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function EntryLayout({ children, params }: LayoutProps) {
  const [entryId, setEntryId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setEntryId(p.id));
  }, [params]);

  if (!entryId) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-5 flex items-center gap-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <EntryProvider entryId={entryId}>
      <EntryLayoutContent>{children}</EntryLayoutContent>
    </EntryProvider>
  );
}
