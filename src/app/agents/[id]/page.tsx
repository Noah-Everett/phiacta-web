import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ClaimTypeBadge, EpistemicBadge } from "@/components/ClaimBadges";
import {
  ChevronRight,
  Star,
  FileText,
  MessageSquare,
  ShieldCheck,
  Bot,
  User,
  Building2,
  Cpu,
  Network,
  TrendingUp,
  BadgeCheck,
  Info,
} from "lucide-react";
import { MOCK_AGENTS, MOCK_CLAIMS, AGENT_REVIEWS_GIVEN } from "@/lib/mock-data";

interface AgentPageProps {
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

const AGENT_TYPE_ICONS: Record<string, React.ElementType> = {
  human: User,
  ai: Bot,
  organization: Building2,
  pipeline: Cpu,
};

const TRUST_LABEL = (score: number) => {
  if (score >= 0.9) return { label: "Highly trusted", color: "text-green-600 dark:text-green-400" };
  if (score >= 0.75) return { label: "Trusted", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 0.5) return { label: "Established", color: "text-amber-600 dark:text-amber-400" };
  return { label: "New contributor", color: "text-muted-foreground" };
};

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;

  const agent = MOCK_AGENTS.find((a) => a.id === id) ?? MOCK_AGENTS[0];
  const agentClaims = MOCK_CLAIMS.filter((c) => c.created_by === agent.id);
  const agentReviews = AGENT_REVIEWS_GIVEN[agent.id] ?? [];

  const TypeIcon = AGENT_TYPE_ICONS[agent.agent_type] ?? User;
  const trust = TRUST_LABEL(agent.trust_score);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground transition-colors">
          Explore
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{agent.name}</span>
      </nav>

      {/* Profile header */}
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar className="h-20 w-20 text-2xl">
          <AvatarFallback className="text-2xl font-semibold">
            {getInitials(agent.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
            <Badge variant="secondary" className="gap-1 capitalize">
              <TypeIcon className="h-3 w-3" />
              {agent.agent_type}
            </Badge>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">{agent.bio}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className={`flex items-center gap-1.5 font-medium ${trust.color}`}>
              <ShieldCheck className="h-3.5 w-3.5" />
              {trust.label}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-muted-foreground">
              Joined{" "}
              {new Date(agent.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <Button variant="outline" size="sm">
          Follow
        </Button>
      </div>

      {/* Primary metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Claims",
            value: agent.claim_count,
            icon: FileText,
            description: "Total published claims",
          },
          {
            label: "Reviews",
            value: agent.review_count,
            icon: MessageSquare,
            description: "Peer reviews written",
          },
          {
            label: "Reach",
            value: agent.reach,
            icon: Network,
            description: "Times their claims are referenced by others",
          },
          {
            label: "Claim index",
            value: agent.claim_index ?? "—",
            icon: TrendingUp,
            description: "Like h-index: N claims each referenced ≥N times",
          },
        ].map(({ label, value, icon: Icon, description }) => (
          <div
            key={label}
            className="group relative flex flex-col items-center rounded-xl border border-border bg-card py-5 px-3 text-center"
            title={description}
          >
            <Icon className="mb-1.5 h-4 w-4 text-muted-foreground" />
            <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Signal quality
        </h3>
        <div className="grid gap-5 sm:grid-cols-3">
          {/* Avg confidence */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Avg. confidence</span>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {agent.avg_confidence != null
                  ? `${Math.round(agent.avg_confidence * 100)}%`
                  : "—"}
              </span>
            </div>
            {agent.avg_confidence != null && (
              <Progress
                value={agent.avg_confidence * 100}
                className="h-1.5"
              />
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Community confidence across their claims
            </p>
          </div>

          {/* Verified claims */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Verification rate</span>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {agent.verified_claims}/{agent.claim_count}
              </span>
            </div>
            <Progress
              value={agent.claim_count > 0 ? (agent.verified_claims / agent.claim_count) * 100 : 0}
              className="h-1.5"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Claims with attached verification materials
            </p>
          </div>

          {/* Trust score */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Trust score</span>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {(agent.trust_score * 100).toFixed(0)}%
              </span>
            </div>
            <Progress value={agent.trust_score * 100} className="h-1.5" />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Weighted by reviewer expertise and signal accuracy
            </p>
          </div>
        </div>

        {agent.verified_claims > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BadgeCheck className="h-3.5 w-3.5 text-green-500" />
              <span>
                <span className="font-semibold text-foreground">{agent.verified_claims}</span>{" "}
                {agent.verified_claims === 1 ? "claim" : "claims"} with verified or empirical status
              </span>
            </div>
          </>
        )}
      </div>

      {/* Metric glossary callout */}
      <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span>
          <strong className="text-foreground">Reach</strong> counts how many times this contributor&apos;s claims have been referenced by other claims.{" "}
          <strong className="text-foreground">Claim index</strong> is analogous to the h-index in academic publishing: a claim index of{" "}
          <em>n</em> means they have published <em>n</em> claims that each have been referenced at least <em>n</em> times.
        </span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="claims">
        <TabsList>
          <TabsTrigger value="claims" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Claims
            <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5">
              {agentClaims.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5">
            <Star className="h-3.5 w-3.5" />
            Reviews
            <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5">
              {agent.review_count}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Claims tab */}
        <TabsContent value="claims" className="mt-4">
          {agentClaims.length > 0 ? (
            <div className="space-y-2">
              {agentClaims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/claims/${claim.id}`}
                  className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <ClaimTypeBadge type={claim.claim_type} />
                    <EpistemicBadge status={claim.epistemic_status} />
                    {(claim.verification_status === "verified" ||
                      claim.verification_status === "empirical") && (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        {claim.verification_status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {claim.title}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {claim.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {new Date(claim.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {claim.cached_confidence != null && (
                      <>
                        <span>·</span>
                        <span className="font-medium text-foreground">
                          {Math.round(claim.cached_confidence * 100)}% confidence
                        </span>
                      </>
                    )}
                    <span>·</span>
                    <span>
                      {claim.agree_count + claim.disagree_count + claim.neutral_count} signals
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-sm text-muted-foreground">No claims published yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Reviews tab */}
        <TabsContent value="reviews" className="mt-4">
          {agentReviews.length > 0 ? (
            <div className="space-y-3">
              {agentReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start gap-3">
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
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/claims/${review.claim_id}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {review.claim_title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Confidence: {Math.round(review.confidence * 100)}% ·{" "}
                        {new Date(review.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Reviews are shown when available in the demo.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This contributor has written {agent.review_count} reviews.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
