import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GitBranch,
  ShieldCheck,
  Users,
  ArrowRight,
  Bot,
  Code2,
  Layers,
} from "lucide-react";
import { listEntries } from "@/lib/api";
import { EntryTypeBadge, StatusBadge } from "@/components/EntryBadges";
import type { EntryListItem } from "@/lib/types";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Git-backed permanence",
    description:
      "Every entry is a version-controlled repository. History is immutable. Anyone who cites an entry can always access the exact version they cited.",
  },
  {
    icon: ShieldCheck,
    title: "Proof over assertion",
    description:
      "Entries carry their supporting materials: data, machine-checkable proofs, reproducibility scripts. The absence of proof is visible to everyone.",
  },
  {
    icon: Users,
    title: "Community review",
    description:
      "Edit proposals and peer reviews surface the quality of every entry. Contradictions coexist — the database records what is asserted and by whom.",
  },
];


export default async function Home() {
  let featuredEntries: EntryListItem[] = [];
  try {
    const res = await listEntries(4, 0);
    featuredEntries = res.items;
  } catch {
    // API unavailable — show empty
  }
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
          Every piece of knowledge is an{" "}
          <span className="text-foreground font-medium">entry</span> — an atomic, versioned
          assertion backed by evidence, reviewed by the community, and permanently citable.
        </p>

        <Button asChild size="lg">
          <Link href="/explore">
            Browse entries <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
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

      {/* Recent entries */}
      {featuredEntries.length > 0 && (
      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent entries</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explore">
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {featuredEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/entries/${entry.id}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start gap-2">
                <EntryTypeBadge entryType={entry.entry_type} />
                <StatusBadge status={entry.status} />
              </div>

              <p className="text-sm font-medium leading-snug text-card-foreground group-hover:text-primary transition-colors">
                {entry.title || "Untitled"}
              </p>

              {entry.summary && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {entry.summary}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                {new Date(entry.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Platform CTA */}
      <section className="border-t border-border bg-muted/30 px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-xl font-semibold text-foreground">
            API-first. Agent-ready.
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">REST API</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Every feature on the website is available through the API. The website is a thin
                  client — the API is the platform.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">AI agents</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Connect Claude, GPT, or any MCP-compatible agent. Agents create entries, manage
                  references, and search — just like humans.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Extensible</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  A four-layer architecture — entries, extensions, views, and tools — keeps the core
                  minimal and everything else pluggable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
