"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { listDocs, getDoc } from "@/lib/api";
import type { DocListItem, DocDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownContent from "@/components/MarkdownContent";
import { cn } from "@/lib/utils";
import { FileText, ArrowLeft } from "lucide-react";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export default function GuidePage({ params }: GuidePageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocListItem[]>([]);
  const [docContent, setDocContent] = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    listDocs().then(setDocs).catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    getDoc(slug)
      .then(setDocContent)
      .catch((err) => setError(err instanceof Error ? err.message : "Guide not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="flex gap-6">
          <div className="w-56 shrink-0 space-y-2 hidden md:block">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !docContent) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Guide not found</h1>
        <p className="mb-4 text-sm text-muted-foreground">{error || "This guide does not exist."}</p>
        <Button variant="outline" asChild>
          <Link href="/guides">All guides</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 gap-1.5 text-muted-foreground"
          asChild
        >
          <Link href="/guides">
            <ArrowLeft className="h-3.5 w-3.5" />
            All guides
          </Link>
        </Button>
        <h1 className="mb-1 text-2xl font-bold text-foreground">Guides</h1>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <nav className="w-full shrink-0 md:w-56">
          <div className="space-y-0.5">
            {docs.map((doc) => (
              <Button
                key={doc.slug}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 text-sm font-medium",
                  slug === doc.slug
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
                asChild
              >
                <Link href={`/guides/${doc.slug}`}>
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doc.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1 rounded-xl border border-border bg-card p-6">
          <MarkdownContent content={docContent.content} />
        </div>
      </div>
    </div>
  );
}
