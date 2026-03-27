"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listDocs } from "@/lib/api";
import type { DocListItem } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, FileText, ArrowRight } from "lucide-react";

export default function GuidesPage() {
  const [docs, setDocs] = useState<DocListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setDocs(await listDocs());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load guides");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Guides</h1>
        <p className="text-sm text-muted-foreground">
          Convention docs and guidelines for creating entries.
        </p>
      </div>
      {docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No guides available yet.</p>
        </div>
      ) : (
        <>
          {/* Featured guide — "Getting Started" or first doc with "start" in slug */}
          {(() => {
            const featured = docs.find((d) => d.slug === "content-guide") || docs[0];
            const rest = docs.filter((d) => d.slug !== featured.slug);
            return (
              <>
                <Link
                  href={`/guides/${featured.slug}`}
                  className="mb-6 flex items-start gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-left transition hover:border-primary/50 hover:shadow-md"
                >
                  <BookOpen className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-foreground">{featured.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {featured.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
                <div className="grid gap-4 sm:grid-cols-2">
                  {rest.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/guides/${doc.slug}`}
                      className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left transition hover:border-primary/30 hover:shadow-sm"
                    >
                      <FileText className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {doc.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
