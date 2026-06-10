import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getEntry } from "@/lib/api";
import { fetchPrimaryContent } from "@/lib/server-content";
import { SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/seo";
import type { EntryDetailResponse } from "@/lib/types";
import EntryLayoutClient from "./EntryLayoutClient";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

// The entry view is per-request and visibility-dependent: render it
// dynamically so the server fetch + useSearchParams resolve at request time
// and the public content lands in the SSR HTML (rather than being statically
// optimized into a client-only shell).
export const dynamic = "force-dynamic";

/**
 * The entry UI (tabs, header, sidebar) is client-side and provides the
 * EntryContext consumed by every nested page, so it stays in
 * EntryLayoutClient. This wrapper exists purely to expose server-side
 * generateMetadata — server components can't live in the same file as a
 * "use client" module.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const url = `${SITE_URL}/entries/${id}`;
  try {
    const entry = await getEntry(id);
    if (entry.visibility !== "public") {
      // Private entries shouldn't leak title/summary to crawlers or
      // show up in rich link previews.
      return {
        title: "Entry",
        description: DEFAULT_DESCRIPTION,
        alternates: { canonical: url },
        robots: { index: false, follow: false },
      };
    }
    const title = entry.title ?? "Untitled entry";
    const description = entry.summary ?? DEFAULT_DESCRIPTION;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        title,
        description,
        url,
        publishedTime: entry.created_at,
        modifiedTime: entry.updated_at,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    // API unreachable or entry not found — fall back to generic metadata
    // rather than breaking the page render.
    return {
      title: "Entry",
      description: DEFAULT_DESCRIPTION,
      alternates: { canonical: url },
    };
  }
}

export default async function EntryLayout({ children, params }: LayoutProps) {
  const { id } = await params;

  // Server-side fetch is token-less => public view only. Seed the client
  // with the entry + its primary content so a PUBLIC entry's title and body
  // are present in the initial HTML (crawler/assistant/no-JS readable).
  // Private or unknown entries fall through to null and the client fetches
  // with the viewer's token after hydration — keeping private data out of
  // the server HTML.
  let initialEntry: EntryDetailResponse | null = null;
  try {
    const entry = await getEntry(id);
    if (entry.visibility === "public") initialEntry = entry;
  } catch {
    // Not found / private (403) / backend unreachable — the client retries.
  }

  let initialContent: string | null = null;
  let initialContentFormat = "md";
  if (initialEntry) {
    const primary = await fetchPrimaryContent(id);
    if (primary) {
      initialContent = primary.content;
      initialContentFormat = primary.format;
    }
  }

  return (
    <EntryLayoutClient
      id={id}
      initialEntry={initialEntry}
      initialContent={initialContent}
      initialContentFormat={initialContentFormat}
    >
      {children}
    </EntryLayoutClient>
  );
}
