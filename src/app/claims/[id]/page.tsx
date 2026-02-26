"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ClaimTypeBadge,
  EpistemicBadge,
  VerificationBadge,
  ConfidenceBar,
} from "@/components/ClaimBadges";
import MarkdownContent from "@/components/MarkdownContent";
import {
  GitBranch,
  MessageSquare,
  History,
  Network,
  ThumbsUp,
  ThumbsDown,
  Minus,
  ExternalLink,
  GitMerge,
  CircleDot,
  ChevronRight,
  ChevronDown,
  FileCode2,
  Folder,
  File,
  Eye,
  Star,
} from "lucide-react";
import {
  MOCK_CLAIMS,
  MOCK_AGENTS,
  MOCK_EDITS,
  MOCK_ISSUES,
  MOCK_HISTORY,
  MOCK_REFERENCES,
  MOCK_REVIEWS,
  MOCK_CLAIM_FILES,
  MOCK_FILE_CONTENTS,
} from "@/lib/mock-data";

interface ClaimPageProps {
  params: Promise<{ id: string }>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// Inline expandable issue
function IssueRow({ issue }: { issue: (typeof MOCK_ISSUES)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 bg-card p-4 text-left hover:bg-accent/40 transition-colors"
      >
        <CircleDot
          className={`mt-0.5 h-4 w-4 shrink-0 ${
            issue.state === "open" ? "text-green-500" : "text-muted-foreground"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{issue.title}</p>
          <p className="text-xs text-muted-foreground">
            #{issue.number} · {issue.author_name} ·{" "}
            {new Date(issue.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{issue.comment_count} replies</span>
          <Badge
            variant="outline"
            className={
              issue.state === "open"
                ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
                : "text-muted-foreground"
            }
          >
            {issue.state}
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
          <p className="text-sm leading-relaxed text-foreground">{issue.body}</p>
          {issue.comments.length > 0 && (
            <div className="space-y-3 pt-2">
              {issue.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(comment.author_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-3">
                    <div className="mb-1.5 flex items-center gap-2 text-xs">
                      <span className="font-semibold text-foreground">{comment.author_name}</span>
                      <span className="text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm">Reply</Button>
            {issue.state === "open" && (
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Close issue
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline expandable edit
function EditRow({ edit }: { edit: (typeof MOCK_EDITS)[0] }) {
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
            #{edit.number} · {edit.author_name} ·{" "}
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
            {edit.state}
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
          <p className="text-sm leading-relaxed text-foreground">{edit.body}</p>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Proposed diff
            </p>
            <pre className="rounded-lg bg-muted p-3 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap text-foreground">
              {edit.diff}
            </pre>
          </div>
          {edit.state === "open" && (
            <div className="flex gap-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                Accept edit
              </Button>
              <Button variant="outline" size="sm">
                Reject
              </Button>
              <Button variant="ghost" size="sm">
                Request changes
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Inline expandable commit
function CommitRow({ commit, index }: { commit: (typeof MOCK_HISTORY)[0]; index: number }) {
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
            {commit.author_name} ·{" "}
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
          <p className="text-sm leading-relaxed text-foreground">{commit.body}</p>
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Files changed
            </p>
            <div className="space-y-1">
              {commit.files_changed.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <code className="font-mono text-foreground">{f}</code>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-600">+{commit.additions}</span>
            <span className="text-red-500">-{commit.deletions}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Eye className="h-3.5 w-3.5" /> View at this version
          </Button>
        </div>
      )}
    </div>
  );
}

// Expandable file preview
function FileRow({ file, claimId }: { file: { path: string; type: "file" | "dir"; size?: number }; claimId: string }) {
  const [open, setOpen] = useState(false);
  const content = MOCK_FILE_CONTENTS[file.path];
  const isPreviewable = file.type === "file" && !!content;

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => isPreviewable && setOpen((v) => !v)}
        className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
          isPreviewable ? "hover:bg-accent/40 cursor-pointer" : "cursor-default"
        }`}
      >
        {file.type === "dir" ? (
          <Folder className="h-4 w-4 shrink-0 text-amber-500" />
        ) : (
          <File className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <code className="flex-1 font-mono text-sm text-foreground">{file.path}</code>
        {file.size && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </span>
        )}
        {isPreviewable && (
          open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && content && (
        <div className="border-t border-border bg-muted/50 px-4 py-3">
          <pre className="font-mono text-xs leading-relaxed overflow-x-auto text-foreground whitespace-pre-wrap">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedId(p.id));
  }, [params]);

  const id = resolvedId ?? "11111111-1111-1111-1111-111111111111";
  const claim = MOCK_CLAIMS.find((c) => c.id === id) ?? MOCK_CLAIMS[0];
  const author = MOCK_AGENTS.find((a) => a.id === claim.created_by) ?? MOCK_AGENTS[0];
  const claimReviews = MOCK_REVIEWS.filter((r) => r.claim_id === claim.id);
  const claimFiles = MOCK_CLAIM_FILES[claim.id] ?? MOCK_CLAIM_FILES.default;
  const totalSignals = claim.agree_count + claim.disagree_count + claim.neutral_count;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground transition-colors">
          Explore
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate max-w-[300px]">{claim.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ClaimTypeBadge type={claim.claim_type} />
          <EpistemicBadge status={claim.epistemic_status} />
          <VerificationBadge status={claim.verification_status} />
        </div>

        <h1 className="mb-4 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
          {claim.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link
            href={`/agents/${author.id}`}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">{getInitials(author.name)}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-foreground">{author.name}</span>
            <Badge variant="outline" className="text-xs py-0">
              {author.agent_type}
            </Badge>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <span>
            {new Date(claim.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {claim.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {claim.topics.map((topic) => (
              <Link
                key={topic}
                href={`/explore?topic=${topic}`}
                className="rounded-full bg-secondary px-3 py-0.5 text-xs text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                {topic}
              </Link>
            ))}
          </div>
        )}
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
                  {MOCK_EDITS.filter((e) => e.state === "open").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="issues" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Issues
                <Badge variant="secondary" className="ml-0.5 text-xs py-0 px-1.5">
                  {MOCK_ISSUES.filter((i) => i.state === "open").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-1.5">
                <Star className="h-3.5 w-3.5" />
                Reviews
                <Badge variant="secondary" className="ml-0.5 text-xs py-0 px-1.5">
                  {claimReviews.length}
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
                {claim.content_cache ? (
                  <MarkdownContent
                    content={claim.content_cache}
                    className="text-sm leading-relaxed text-card-foreground"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Content stored in the versioned repository.</p>
                )}
              </div>

              {/* Voting */}
              <div className="mt-4 rounded-xl border border-border bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Cast your signal</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    Agree
                    <span className="text-muted-foreground tabular-nums">{claim.agree_count}</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    Disagree
                    <span className="text-muted-foreground tabular-nums">{claim.disagree_count}</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Minus className="h-4 w-4 text-muted-foreground" />
                    Neutral
                    <span className="text-muted-foreground tabular-nums">{claim.neutral_count}</span>
                  </Button>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Write a review
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Edits */}
            <TabsContent value="edits">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Edits are proposed content changes — like pull requests on the claim&apos;s content.
                </p>
                <Button size="sm">Propose edit</Button>
              </div>
              <div className="space-y-2">
                {MOCK_EDITS.map((edit) => (
                  <EditRow key={edit.number} edit={edit} />
                ))}
              </div>
            </TabsContent>

            {/* Issues */}
            <TabsContent value="issues">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Issues track questions, problems, and discussions about this claim.
                </p>
                <Button size="sm">Open issue</Button>
              </div>
              <div className="space-y-2">
                {MOCK_ISSUES.map((issue) => (
                  <IssueRow key={issue.number} issue={issue} />
                ))}
              </div>
            </TabsContent>

            {/* Reviews */}
            <TabsContent value="reviews">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Structured peer assessments with confidence ratings.
                </p>
                <Button size="sm">Write review</Button>
              </div>
              <div className="space-y-3">
                {claimReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-border bg-card p-5 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs">{getInitials(review.author_name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Link
                            href={`/agents/${review.author_id}`}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {review.author_name}
                          </Link>
                          <Badge
                            variant="outline"
                            className={
                              review.signal === "agree"
                                ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
                                : review.signal === "disagree"
                                ? "text-red-700 border-red-200 bg-red-50 dark:text-red-300 dark:border-red-800 dark:bg-red-950/50"
                                : "text-muted-foreground"
                            }
                          >
                            {review.signal}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(review.confidence * 100)}% confidence
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-foreground">{review.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {claimReviews.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border py-10 text-center">
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <div className="space-y-2">
                {MOCK_HISTORY.map((commit, i) => (
                  <CommitRow key={commit.sha} commit={commit} index={i} />
                ))}
              </div>
            </TabsContent>

            {/* Files */}
            <TabsContent value="files">
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Repository contents
                  </p>
                  <code className="font-mono text-xs text-muted-foreground">
                    {claim.id.slice(0, 8)}
                  </code>
                </div>
                <div className="divide-y-0">
                  {claimFiles.map((file) => (
                    <FileRow key={file.path} file={file} claimId={claim.id} />
                  ))}
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-border bg-card p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Clone this claim
                </p>
                <code className="block w-full rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground break-all">
                  git clone https://phiacta.com/git/{claim.id.slice(0, 8)}.git
                </code>
              </div>
            </TabsContent>

            {/* References */}
            <TabsContent value="references">
              <div className="space-y-2">
                {MOCK_REFERENCES.map((ref) => (
                  <Link
                    key={ref.id}
                    href={`/claims/${ref.target_claim_id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <Badge
                      variant="outline"
                      className="shrink-0 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800"
                    >
                      {ref.role}
                    </Badge>
                    <span className="min-w-0 flex-1 text-sm text-foreground hover:text-primary truncate transition-colors">
                      {ref.target_title}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
                {MOCK_REFERENCES.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No references yet.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {claim.cached_confidence != null && (
            <div className="rounded-xl border border-border bg-card p-5">
              <ConfidenceBar value={claim.cached_confidence} count={totalSignals} />
              <Separator className="my-3" />
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "agree", count: claim.agree_count, color: "text-green-600 dark:text-green-400" },
                  { label: "disagree", count: claim.disagree_count, color: "text-red-500 dark:text-red-400" },
                  { label: "neutral", count: claim.neutral_count, color: "text-muted-foreground" },
                ].map(({ label, count, color }) => (
                  <div key={label}>
                    <p className={`text-base font-semibold tabular-nums ${color}`}>{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Author</h3>
            <Link href={`/agents/${author.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{author.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{author.agent_type}</p>
              </div>
            </Link>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-sm font-semibold tabular-nums text-foreground">{author.claim_count}</p>
                <p className="text-xs text-muted-foreground">claims</p>
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums text-foreground">{author.reach}</p>
                <p className="text-xs text-muted-foreground">reach</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metadata</h3>
            <dl className="space-y-2.5 text-sm">
              {[
                { label: "Type", value: claim.claim_type },
                { label: "Format", value: claim.format },
                { label: "Published", value: new Date(claim.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
                { label: "Last updated", value: new Date(claim.updated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
