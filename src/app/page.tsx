import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  GitBranch,
  ShieldCheck,
  Users,
  Search,
  ArrowRight,
  FlaskConical,
  BookOpen,
  Cpu,
} from "lucide-react";
import { MOCK_CLAIMS } from "@/lib/mock-data";
import { EpistemicBadge, VerificationBadge, ClaimTypeBadge } from "@/components/ClaimBadges";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Git-backed permanence",
    description:
      "Every claim is a version-controlled repository. History is immutable. Anyone who cites a claim can always access the exact version they cited.",
  },
  {
    icon: ShieldCheck,
    title: "Proof over assertion",
    description:
      "Claims carry their supporting materials: data, machine-checkable proofs, reproducibility scripts. The absence of proof is visible to everyone.",
  },
  {
    icon: Users,
    title: "Community confidence",
    description:
      "Votes and peer reviews surface the epistemic status of every claim. Contradictions coexist — the database records what is asserted and by whom.",
  },
];

const STATS = [
  { label: "Claims", value: "1,247" },
  { label: "Contributors", value: "89" },
  { label: "Reviews", value: "3,841" },
  { label: "Verified proofs", value: "94" },
];

const FEATURED_CLAIMS = MOCK_CLAIMS.slice(0, 4);

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-16 pt-20 text-center">
        <Image
          src="/logo-full.svg"
          alt="Phiacta"
          width={330}
          height={240}
          className="mb-6 h-20 w-auto dark:invert"
        />
        <h1 className="sr-only">Phiacta</h1>
        <p className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          The knowledge backend.
        </p>
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Every piece of knowledge is a{" "}
          <span className="text-foreground font-medium">claim</span> — an atomic, versioned
          assertion backed by evidence, reviewed by the community, and permanently citable.
        </p>

        <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <form action="/search">
              <Input
                name="q"
                placeholder="Search claims, topics, authors…"
                className="pl-9 h-10"
              />
            </form>
          </div>
          <Button asChild>
            <Link href="/explore">
              Browse all claims <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto flex max-w-3xl divide-x divide-border">
          {STATS.map(({ label, value }) => (
            <div key={label} className="flex-1 py-5 text-center">
              <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-center text-xl font-semibold text-foreground">
          What makes Phiacta different
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-border">
              <CardContent className="p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent claims */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent claims</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explore">
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURED_CLAIMS.map((claim) => (
            <Link
              key={claim.id}
              href={`/claims/${claim.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start gap-2">
                <ClaimTypeBadge type={claim.claim_type} />
                <EpistemicBadge status={claim.epistemic_status} />
                <VerificationBadge status={claim.verification_status} />
              </div>

              <p className="text-sm font-medium leading-snug text-card-foreground group-hover:text-primary transition-colors">
                {claim.title}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {claim.topics.slice(0, 3).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {topic}
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
      </section>

      {/* Extensions CTA */}
      <section className="border-t border-border bg-muted/30 px-6 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-3 text-xl font-semibold text-foreground">
            Built for extensions
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Phiacta is an API-first knowledge base. Third-party extensions connect to generate
            papers, podcasts, lecture slides, or ingest PDFs — without Phiacta ever producing
            content itself.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { icon: BookOpen, label: "Paper generator" },
              { icon: Cpu, label: "PDF ingestion pipeline" },
              { icon: FlaskConical, label: "Proof verifier" },
            ].map(({ icon: Icon, label }) => (
              <Badge key={label} variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <Icon className="h-3 w-3" /> {label}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
