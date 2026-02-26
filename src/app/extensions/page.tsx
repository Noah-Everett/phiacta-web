"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MOCK_EXTENSIONS } from "@/lib/mock-data";
import { Search, ExternalLink, Download, ShieldCheck, Puzzle } from "lucide-react";

const CATEGORIES = ["all", "input", "output", "verification"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  input: "Input",
  output: "Output",
  verification: "Verification",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  input: "Import data and extract claims from external sources",
  output: "Generate papers, slides, audio, and other formats from claims",
  verification: "Automated checking, proof verification, and reproducibility",
};

export default function ExtensionsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = MOCK_EXTENSIONS.filter((ext) => {
    if (
      search &&
      !ext.name.toLowerCase().includes(search.toLowerCase()) &&
      !ext.description.toLowerCase().includes(search.toLowerCase()) &&
      !ext.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }
    if (selectedCategory !== "all" && ext.category !== selectedCategory) return false;
    return true;
  });

  const officialCount = MOCK_EXTENSIONS.filter((e) => e.is_official).length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <Puzzle className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Extensions</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Third-party apps that connect to the Phiacta API to extend what you can do with your claims.
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{MOCK_EXTENSIONS.length}</span> extensions
        </span>
        <span>·</span>
        <span>
          <span className="font-semibold text-foreground">{officialCount}</span> official
        </span>
        <span>·</span>
        <span>
          <span className="font-semibold text-foreground">
            {MOCK_EXTENSIONS.reduce((sum, e) => sum + e.installs, 0).toLocaleString()}
          </span>{" "}
          total installs
        </span>
      </div>

      {/* What are extensions? */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {Object.entries(CATEGORY_DESCRIPTIONS).map(([cat, desc]) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? "all" : cat)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              selectedCategory === cat
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <p className="mb-1 text-sm font-semibold capitalize text-foreground">{cat}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>

      <Separator className="mb-6" />

      {/* Search + filter */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search extensions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                selectedCategory === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
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
              <Badge variant="outline" className="shrink-0 capitalize text-xs">
                {ext.category}
              </Badge>
            </div>

            <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {ext.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4">
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
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Download className="h-3.5 w-3.5" />
                <span>{ext.installs.toLocaleString()} installs</span>
                {ext.claim_count > 0 && (
                  <>
                    <span>·</span>
                    <span>{ext.claim_count.toLocaleString()} claims processed</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  Docs
                </Button>
                <Button size="sm">Install</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No extensions match your search.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <Separator className="mt-10 mb-6" />

      {/* Build your own */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Puzzle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <h3 className="mb-1 text-base font-semibold text-foreground">Build your own extension</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Every feature on the website is accessible through the Phiacta API. Build any output
          or input integration on top of the same claim data and list it in this marketplace.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline">API docs</Button>
          <Button>Submit extension</Button>
        </div>
      </div>
    </div>
  );
}
