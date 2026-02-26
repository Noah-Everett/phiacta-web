import Link from "next/link";
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
} from "lucide-react";
import {
  MOCK_CLAIMS,
  MOCK_AGENTS,
  MOCK_PROPOSALS,
  MOCK_ISSUES,
  MOCK_HISTORY,
  MOCK_REFERENCES,
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

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { id } = await params;

  // Use mock data — backend will be wired up later
  const claim = MOCK_CLAIMS.find((c) => c.id === id) ?? MOCK_CLAIMS[0];
  const author = MOCK_AGENTS.find((a) => a.id === claim.created_by) ?? MOCK_AGENTS[0];

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

        {/* Topics */}
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
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="content" className="gap-1.5">
                Content
              </TabsTrigger>
              <TabsTrigger value="proposals" className="gap-1.5">
                <GitBranch className="h-3.5 w-3.5" />
                Proposals
                <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5">
                  {MOCK_PROPOSALS.filter((p) => p.state === "open").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="issues" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Issues
                <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5">
                  {MOCK_ISSUES.filter((i) => i.state === "open").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                <History className="h-3.5 w-3.5" />
                History
              </TabsTrigger>
              <TabsTrigger value="references" className="gap-1.5">
                <Network className="h-3.5 w-3.5" />
                References
              </TabsTrigger>
            </TabsList>

            {/* Content tab */}
            <TabsContent value="content">
              <div className="rounded-xl border border-border bg-card p-6">
                {claim.content_cache ? (
                  <MarkdownContent
                    content={claim.content_cache}
                    className="text-sm leading-relaxed text-card-foreground"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Content is stored in the git repository.
                  </p>
                )}
              </div>

              {/* Voting */}
              <div className="mt-4 rounded-xl border border-border bg-card p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">
                  Cast your signal
                </h3>
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

            {/* Proposals tab */}
            <TabsContent value="proposals">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Proposals are proposed content changes — like pull requests.
                </p>
                <Button size="sm">Open proposal</Button>
              </div>
              <div className="space-y-3">
                {MOCK_PROPOSALS.map((proposal) => (
                  <div
                    key={proposal.number}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    {proposal.state === "open" ? (
                      <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    ) : (
                      <GitMerge className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{proposal.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        #{proposal.number} · {proposal.author_name} ·{" "}
                        {new Date(proposal.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                        {proposal.body}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        proposal.state === "open"
                          ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
                          : "text-violet-700 border-violet-200 bg-violet-50 dark:text-violet-300 dark:border-violet-800 dark:bg-violet-950/50"
                      }
                    >
                      {proposal.state}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Issues tab */}
            <TabsContent value="issues">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Issues track questions, problems, and discussions about this claim.
                </p>
                <Button size="sm">Open issue</Button>
              </div>
              <div className="space-y-3">
                {MOCK_ISSUES.map((issue) => (
                  <div
                    key={issue.number}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <CircleDot
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        issue.state === "open" ? "text-green-500" : "text-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{issue.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        #{issue.number} · {issue.author_name} ·{" "}
                        {new Date(issue.created_at).toLocaleDateString()}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                        {issue.body}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {issue.comment_count} comments
                      </span>
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
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* History tab */}
            <TabsContent value="history">
              <div className="space-y-1">
                {MOCK_HISTORY.map((commit, i) => (
                  <div
                    key={commit.sha}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-mono text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{commit.message}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {commit.author_name} ·{" "}
                        {new Date(commit.timestamp).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <code className="shrink-0 font-mono text-[10px] text-muted-foreground">
                      {commit.sha.slice(0, 7)}
                    </code>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* References tab */}
            <TabsContent value="references">
              <div className="space-y-3">
                {MOCK_REFERENCES.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                  >
                    <Badge
                      variant="outline"
                      className="shrink-0 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800"
                    >
                      {ref.role}
                    </Badge>
                    <Link
                      href={`/claims/${ref.target_claim_id}`}
                      className="min-w-0 flex-1 text-sm text-foreground hover:text-primary truncate transition-colors"
                    >
                      {ref.target_title}
                    </Link>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </div>
                ))}
                {MOCK_REFERENCES.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No references yet.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Confidence */}
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

          {/* Author */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Author
            </h3>
            <Link
              href={`/agents/${author.id}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
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
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {author.claim_count}
                </p>
                <p className="text-xs text-muted-foreground">claims</p>
              </div>
              <div>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {(author.trust_score * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">trust</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Metadata
            </h3>
            <dl className="space-y-2.5 text-sm">
              {[
                { label: "Type", value: claim.claim_type },
                { label: "Format", value: claim.format },
                {
                  label: "Published",
                  value: new Date(claim.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                },
                {
                  label: "Last updated",
                  value: new Date(claim.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }),
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-foreground capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Git */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Repository
            </h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full gap-2 justify-start text-xs">
                <GitBranch className="h-3.5 w-3.5" />
                Clone claim
              </Button>
              <code className="block w-full rounded-md bg-muted px-3 py-2 font-mono text-[10px] text-muted-foreground break-all">
                git clone https://phiacta.com/git/{claim.id.slice(0, 8)}.git
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
