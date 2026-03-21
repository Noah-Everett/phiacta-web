"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutHintBadge, StatusBadge } from "@/components/EntryBadges";
import MarkdownContent from "@/components/MarkdownContent";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import {
  GitBranch,
  History,
  Network,
  ExternalLink,
  GitMerge,
  ChevronRight,
  ChevronDown,
  FileCode2,
  File,
  Tag,
} from "lucide-react";
import { getEntry, getAgent, getEntryFiles, getEntryEdits, getEntryHistory, getEntryTags, ApiError } from "@/lib/api";
import type {
  EntryDetailResponse,
  EditProposalListItem,
  CommitListItem,
  FileListItem,
  EntryRefResponse,
  PublicAgentResponse,
  TagResponse,
} from "@/lib/types";

interface EntryPageProps {
  params: Promise<{ id: string }>;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// Inline expandable edit
function EditRow({ edit }: { edit: EditProposalListItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 bg-card p-4 text-left hover:bg-accent/40 transition-colors"
      >
        {edit.state === "open" ? (
          <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
        ) : (
          <GitMerge className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{edit.title}</p>
          <p className="text-xs text-muted-foreground">
            #{edit.number} &middot; {edit.author.handle} &middot;{" "}
            {new Date(edit.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className={
              edit.state === "open"
                ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
                : "text-violet-700 border-violet-200 bg-violet-50 dark:text-violet-300 dark:border-violet-800 dark:bg-violet-950/50"
            }
          >
            {edit.merged_at ? "merged" : edit.state}
          </Badge>
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border bg-background p-4 space-y-4">
          {edit.body && (
            <p className="text-sm leading-relaxed text-foreground">{edit.body}</p>
          )}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Branch: <code className="font-mono">{edit.head_branch}</code> &rarr; <code className="font-mono">{edit.base_branch}</code></p>
            {edit.is_draft && <p className="text-amber-600 dark:text-amber-400">Draft</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline expandable commit
function CommitRow({ commit, index }: { commit: CommitListItem; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 bg-card p-4 text-left hover:bg-accent/40 transition-colors"
      >
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-mono text-muted-foreground">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{commit.message}</p>
          <p className="text-xs text-muted-foreground">
            {commit.author.name} &middot;{" "}
            {new Date(commit.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <code className="font-mono text-[10px] text-muted-foreground">
            {commit.sha.slice(0, 7)}
          </code>
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border bg-background p-4 space-y-3">
          <div className="text-xs text-muted-foreground">
            <p>Author: {commit.author.name} &lt;{commit.author.email}&gt;</p>
            <p>Full SHA: <code className="font-mono">{commit.sha}</code></p>
          </div>
        </div>
      )}
    </div>
  );
}

// File row
function FileRow({ file }: { file: FileListItem }) {
  return (
    <div className="border-b border-border last:border-0">
      <div className="flex w-full items-center gap-2.5 px-3 py-2.5">
        <File className="h-4 w-4 shrink-0 text-muted-foreground" />
        <code className="flex-1 font-mono text-sm text-foreground">{file.path}</code>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {formatBytes(file.size)}
        </span>
      </div>
    </div>
  );
}

// Reference row
function RefRow({ entryRef: r }: { entryRef: EntryRefResponse }) {
  return (
    <Link
      href={`/entries/${r.to_entry_id}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <Badge
        variant="outline"
        className="shrink-0 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800"
      >
        {r.rel}
      </Badge>
      <div className="min-w-0 flex-1">
        <span className="text-sm text-foreground hover:text-primary truncate block transition-colors">
          {r.to_entry_id}
        </span>
        {r.note && (
          <span className="text-xs text-muted-foreground">{r.note}</span>
        )}
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export default function EntryPage({ params }: EntryPageProps) {
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [entry, setEntry] = useState<EntryDetailResponse | null>(null);
  const [author, setAuthor] = useState<PublicAgentResponse | null>(null);
  const [entryFiles, setEntryFiles] = useState<FileListItem[]>([]);
  const [edits, setEdits] = useState<EditProposalListItem[]>([]);
  const [history, setHistory] = useState<CommitListItem[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [outgoingRefs, setOutgoingRefs] = useState<EntryRefResponse[]>([]);
  const [incomingRefs, setIncomingRefs] = useState<EntryRefResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    params.then((p) => setResolvedId(p.id));
  }, [params]);

  useEffect(() => {
    if (!resolvedId) return;

    setLoading(true);
    setError(null);

    getEntry(resolvedId)
      .then((data) => {
        setEntry(data);
        setOutgoingRefs(data.outgoing_refs);
        setIncomingRefs(data.incoming_refs);
        getAgent(data.created_by).then(setAuthor).catch(() => {});
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        }
        setError(err instanceof Error ? err.message : "Failed to load entry");
      })
      .finally(() => setLoading(false));

    getEntryFiles(resolvedId).then(setEntryFiles).catch(() => {});
    getEntryEdits(resolvedId).then(setEdits).catch(() => {});
    getEntryHistory(resolvedId).then(setHistory).catch(() => {});
    getEntryTags(resolvedId).then((res) => setTags(Array.isArray(res.tags) ? res.tags : [])).catch(() => {});
  }, [resolvedId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-5 flex items-center gap-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-40" />
        </div>
        {/* Header skeleton */}
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
        {/* Content skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
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
        <Link href="/explore" className="hover:text-foreground transition-colors">
          Explore
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[300px]">{entry.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <LayoutHintBadge hint={entry.layout_hint} />
          <StatusBadge status={entry.status} />
        </div>

        <h1 className="mb-4 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          {entry.title}
        </h1>

        {entry.summary && (
          <p className="mb-4 text-sm text-muted-foreground">{entry.summary}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {author && (
            <>
            <Link
              href={`/agents/${author.id}`}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">{getInitials(author.handle)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{author.handle}</span>
              <Badge variant="outline" className="text-xs py-0">
                {author.agent_type}
              </Badge>
            </Link>
            <Separator orientation="vertical" className="h-4" />
            </>
          )}
          <span>
            {new Date(entry.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main panel */}
        <div className="min-w-0">
          <Tabs defaultValue="content">
            <TabsList className="mb-4 w-full justify-start flex-wrap h-auto gap-1">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="edits" className="gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                Edits
                <Badge variant="secondary" className="ml-0.5 text-xs py-0 px-1.5">
                  {edits.filter((e) => e.state === "open").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                <History className="h-3.5 w-3.5" />
                History
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-1.5">
                <FileCode2 className="h-3.5 w-3.5" />
                Files
              </TabsTrigger>
              <TabsTrigger value="references" className="gap-1.5">
                <Network className="h-3.5 w-3.5" />
                References
              </TabsTrigger>
            </TabsList>

            {/* Content */}
            <TabsContent value="content">
              <div className="rounded-xl border border-border bg-card p-6">
                {entry.content_cache ? (
                  <MarkdownContent
                    content={entry.content_cache}
                    className="text-sm leading-relaxed text-card-foreground"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Content stored in the versioned repository.</p>
                )}
              </div>
            </TabsContent>

            {/* Edits */}
            <TabsContent value="edits">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Edit proposals are content changes — like pull requests on the entry&apos;s repository.
                </p>
                <Button size="sm">Propose edit</Button>
              </div>
              <div className="space-y-2">
                {edits.map((edit) => (
                  <EditRow key={edit.number} edit={edit} />
                ))}
                {edits.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No edit proposals yet.</p>
                )}
              </div>
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <div className="space-y-2">
                {history.map((commit, i) => (
                  <CommitRow key={commit.sha} commit={commit} index={i} />
                ))}
                {history.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No commit history yet.</p>
                )}
              </div>
            </TabsContent>

            {/* Files */}
            <TabsContent value="files">
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Files
                  </p>
                  <code className="font-mono text-xs text-muted-foreground">
                    {entry.id.slice(0, 8)}
                  </code>
                </div>
                <div className="divide-y-0">
                  {entryFiles.map((file) => (
                    <FileRow key={file.path} file={file} />
                  ))}
                  {entryFiles.length === 0 && (
                    <p className="py-8 text-center text-sm text-muted-foreground">No files yet.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* References */}
            <TabsContent value="references">
              {outgoingRefs.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Outgoing references
                  </h3>
                  <div className="space-y-2">
                    {outgoingRefs.map((r) => (
                      <RefRow key={r.id} entryRef={r} />
                    ))}
                  </div>
                </div>
              )}
              {incomingRefs.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Incoming references
                  </h3>
                  <div className="space-y-2">
                    {incomingRefs.map((r) => (
                      <RefRow key={r.id} entryRef={r} />
                    ))}
                  </div>
                </div>
              )}
              {outgoingRefs.length === 0 && incomingRefs.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No references yet.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {author && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Author</h3>
            <Link href={`/agents/${author.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{getInitials(author.handle)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{author.handle}</p>
                <p className="text-xs text-muted-foreground capitalize">{author.agent_type}</p>
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
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metadata</h3>
            <dl className="space-y-2.5 text-sm">
              {[
                { label: "Layout hint", value: entry.layout_hint || "none" },
                { label: "Format", value: entry.content_format },
                { label: "License", value: entry.license || "not specified" },
                { label: "Published", value: new Date(entry.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
                { label: "Last updated", value: new Date(entry.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {tags.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="mr-1.5 inline h-3 w-3" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Badge key={t.tag} variant="secondary" className="text-xs">
                  {t.tag}
                </Badge>
              ))}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
