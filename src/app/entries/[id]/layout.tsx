import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getEntry } from "@/lib/api";
import { SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/seo";
import EntryLayoutClient from "./EntryLayoutClient";

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

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

export default function EntryLayout({ children, params }: LayoutProps) {
  return <EntryLayoutClient params={params}>{children}</EntryLayoutClient>;
}
