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
import { EntryCarousel } from "@/components/EntryCarousel";
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
  try {
    const res = await listEntries(8, null, { sort: "updated_at", order: "desc" });
    featuredEntries = res.items;
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
            <Link href="/about">
              Learn more <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/explore">
              Browse entries
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

        {/* TODO: add stats section when there are enough real entries
           (cursor-based pagination no longer returns total count) */}
      </section>

      {/* Recent entries — auto-scrolling carousel */}
      {featuredEntries.length > 0 && (
      <section className="pt-12 pb-4">
        <EntryCarousel entries={featuredEntries} />
      </section>
      )}

      {/* What makes it different */}
      <section className="bg-muted/20 px-6 py-10">
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

    </div>
  );
}
