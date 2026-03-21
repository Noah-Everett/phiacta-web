"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, ExternalLink, Link2, ShieldCheck, Puzzle } from "lucide-react";

const EXTENSIONS = [
  { id: "ext-1", name: "Paper Generator", slug: "paper-generator", description: "Takes a set of entries and produces a formatted academic paper in LaTeX or PDF. Handles citation formatting, figure placement, and journal style templates.", icon: "\u{1F4C4}", author: "Phiacta Labs", is_official: true, uses: 1_243, tags: ["publishing", "latex", "pdf"] },
  { id: "ext-2", name: "Lecture Slide Builder", slug: "slide-builder", description: "Generates teaching materials from entries. Creates structured slide decks with summaries, evidence levels, and discussion questions for classroom use.", icon: "\u{1F393}", author: "EduFlow", is_official: false, uses: 892, tags: ["education", "slides", "teaching"] },
  { id: "ext-3", name: "Podcast Creator", slug: "podcast-creator", description: "Converts an entry and its discussion threads into a structured audio conversation. Two AI hosts summarize the entry, review the evidence, and present opposing views.", icon: "\u{1F399}\uFE0F", author: "AudioKnowledge", is_official: false, uses: 2_108, tags: ["audio", "ai", "accessibility"] },
  { id: "ext-4", name: "Literature Review Builder", slug: "lit-review", description: "Generates a structured literature review from a set of entries. Organises evidence by status, groups related entries, and produces a formatted survey document.", icon: "\u{1F4DA}", author: "OpenClaims Community", is_official: false, uses: 1_677, tags: ["research", "survey", "publishing"] },
  { id: "ext-5", name: "Entry Graph Explorer", slug: "graph-explorer", description: "An interactive visual explorer for entry reference networks. Pan, zoom, filter by type, and export graph views as SVG or PNG for use in presentations and papers.", icon: "\u{1F578}\uFE0F", author: "Phiacta Labs", is_official: true, uses: 3_481, tags: ["visualisation", "graph", "presentation"] },
  { id: "ext-6", name: "Textbook Composer", slug: "textbook-composer", description: "Assembles a set of entries into a structured textbook chapter. Produces introduction, body sections organised by reference graph, summary, and review questions.", icon: "\u{1F4D6}", author: "CurriculaAI", is_official: false, uses: 417, tags: ["education", "publishing", "long-form"] },
];

export default function ExtensionsPage() {
  const [search, setSearch] = useState("");

  const filtered = EXTENSIONS.filter((ext) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ext.name.toLowerCase().includes(q) ||
      ext.description.toLowerCase().includes(q) ||
      ext.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Puzzle className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Extensions</h1>
      </div>
      <p className="mb-2 text-sm text-muted-foreground">
        Third-party apps that connect to the Phiacta API to generate new outputs from your entries.
      </p>
      <p className="mb-8 text-sm text-muted-foreground">
        Extensions run their own compute and read your entries through the API — you authorize access,
        they do the work.
      </p>

      {/* Stats row */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{EXTENSIONS.length}</span> extensions
        </span>
        <span>&middot;</span>
        <span>
          <span className="font-semibold text-foreground">
            {EXTENSIONS.filter((e) => e.is_official).length}
          </span>{" "}
          official
        </span>
        <span>&middot;</span>
        <span>
          <span className="font-semibold text-foreground">
            {EXTENSIONS.reduce((sum, e) => sum + e.uses, 0).toLocaleString()}
          </span>{" "}
          total uses
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search extensions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Extension grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((ext) => (
          <div
            key={ext.id}
            className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm"
          >
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xl">
                {ext.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">{ext.name}</span>
                  {ext.is_official && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <ShieldCheck className="h-3 w-3" />
                      Official
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">by {ext.author}</p>
              </div>
            </div>

            <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {ext.description}
            </p>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {ext.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {ext.uses.toLocaleString()} uses
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  Docs
                </Button>
                <Button size="sm" className="gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  Connect
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No extensions match your search.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSearch("")}>
            Clear
          </Button>
        </div>
      )}

      <Separator className="mt-10 mb-6" />

      {/* Build your own */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Puzzle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h3 className="mb-1 text-base font-semibold text-foreground">Build your own extension</h3>
        <p className="mb-4 mx-auto max-w-sm text-sm text-muted-foreground">
          Extensions connect to the Phiacta API with standard OAuth. They read entries and push
          outputs — papers, audio, slides, graphs. List yours in this marketplace.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline">API docs</Button>
          <Button>Submit extension</Button>
        </div>
      </div>
    </div>
  );
}
