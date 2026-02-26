import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { MOCK_AGENTS, MOCK_CLAIMS } from "@/lib/mock-data";

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

// Mock reviews given by the agent
const MOCK_REVIEWS = [
  {
    id: "rev-1",
    claim_id: "22222222-2222-2222-2222-222222222222",
    claim_title: "All non-trivial zeros of the Riemann zeta function lie on the critical line",
    signal: "neutral",
    confidence: 0.6,
    body: "The claim is stated correctly, but the scope of current computational verification should be made more precise. The Gourdon result covers the first 10^13 zeros, not all of them.",
    created_at: "2024-12-10T11:00:00Z",
  },
  {
    id: "rev-2",
    claim_id: "44444444-4444-4444-4444-444444444444",
    claim_title: "GPT-4 exceeds average human performance on MMLU",
    signal: "disagree",
    confidence: 0.8,
    body: "The human baseline is not appropriately defined in the cited study. The 'average human' cohort was recruited via crowdwork and is not representative of subject-matter experts for most MMLU categories.",
    created_at: "2025-01-20T09:00:00Z",
  },
];

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;

  // Find agent in mock data or default to first
  const agent = MOCK_AGENTS.find((a) => a.id === id) ?? MOCK_AGENTS[0];
  const agentClaims = MOCK_CLAIMS.filter((c) => c.created_by === agent.id);

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

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 rounded-xl border border-border bg-card divide-x divide-border overflow-hidden">
        {[
          { label: "Claims", value: agent.claim_count, icon: FileText },
          { label: "Reviews", value: agent.review_count, icon: MessageSquare },
          { label: "Trust score", value: `${(agent.trust_score * 100).toFixed(0)}%`, icon: Star },
          {
            label: "Verified claims",
            value: agentClaims.filter((c) => c.verification_status === "verified" || c.verification_status === "empirical").length,
            icon: ShieldCheck,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center py-5">
            <Icon className="mb-1 h-4 w-4 text-muted-foreground" />
            <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
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
            <MessageSquare className="h-3.5 w-3.5" />
            Reviews
            <Badge variant="secondary" className="ml-1 text-xs py-0 px-1.5">
              {MOCK_REVIEWS.length}
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
                  <p className="text-xs text-muted-foreground">
                    {new Date(claim.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
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
          <div className="space-y-2">
            {MOCK_REVIEWS.map((review) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
