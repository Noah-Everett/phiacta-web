import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GitBranch,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  FileText,
  Search,
  Code2,
  Sparkles,
  Bot,
  Github,
} from "lucide-react";
import { listEntries } from "@/lib/api";
import { EntryTypeBadge } from "@/components/EntryBadges";
import type { EntryListItem } from "@/lib/types";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Versioned and permanent",
    description:
      "Every entry is a git repository with immutable history. What you cite today is accessible forever.",
  },
  {
    icon: ShieldCheck,
    title: "Evidence attached",
    description:
      "Data, proofs, code, figures — attached directly. The presence or absence of evidence is visible to everyone.",
  },
  {
    icon: MessageSquare,
    title: "Open review",
    description:
      "Anyone can open issues, propose edits, and add references. The platform records what is asserted and by whom.",
  },
  {
    icon: Sparkles,
    title: "Built to last",
    description:
      "Entries can be cloned and verified independently. New capabilities are added via plugins without changing what's already published.",
  },
  {
    icon: Code2,
    title: "Programmatic access",
    description:
      "REST API and Python SDK — build tools, pipelines, and integrations on top of Phiacta. AI agents connect via MCP with full provenance.",
  },
  {
    icon: Github,
    title: "Open access",
    description:
      "All entries are public by default. The entire platform — backend, website, SDK, MCP server — is open source. Self-host, fork, or contribute.",
  },
];

export default async function Home() {
  let featuredEntries: EntryListItem[] = [];
  let totalEntries = 0;
  try {
    const res = await listEntries(4, 0, { sort: "updated_at", order: "desc" });
    featuredEntries = res.items;
    totalEntries = res.total;
  } catch {
    // API unavailable — show empty
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center px-6 pb-6 pt-20 text-center">
        <Image
          src="/logo-full.svg"
          alt="Phiacta"
          width={330}
          height={240}
          className="mb-6 h-20 w-auto dark:invert"
        />
        <h1 className="sr-only">Phiacta</h1>
        <p className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          A permanent home for knowledge.
        </p>

        <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Phiacta is an open platform where knowledge is stored as versioned, citable entries —
          each backed by a git repository with immutable history. Publish findings, attach evidence,
          connect ideas, and build on each other&apos;s work.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/explore">
              Browse entries <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/post">
              Create an entry
            </Link>
          </Button>
        </div>

        {/* What you can do — compact row under buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-8 text-center">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Share knowledge</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Search className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Explore and review</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Build with the API &amp; SDK</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Connect AI agents</span>
          </div>
        </div>

        {/* TODO: uncomment when there are enough real entries
        {totalEntries > 0 && (
          <div className="mt-10 flex gap-12 text-center">
            <div>
              <p className="text-3xl font-bold text-foreground">{totalEntries}</p>
              <p className="text-sm text-muted-foreground">entries</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">Open</p>
              <p className="text-sm text-muted-foreground">source</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">Forever</p>
              <p className="text-sm text-muted-foreground">versioned</p>
            </div>
          </div>
        )}
        */}
      </section>

      {/* What makes it different */}
      <section className="mt-8 border-t border-border bg-muted/20 px-6 py-14">
        <div className="mx-auto max-w-5xl">
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
        </div>
      </section>

      {/* Recent entries */}
      {featuredEntries.length > 0 && (
      <section className="mx-auto w-full max-w-5xl px-6 py-14">
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

    </div>
  );
}
