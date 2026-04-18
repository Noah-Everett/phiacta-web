import type { MetadataRoute } from "next";
import { listEntries, listDocs } from "@/lib/api";
import { SITE_URL } from "@/lib/seo";

// Regenerate the sitemap at most once an hour. Entries change often enough
// that a static build-time sitemap would go stale, but rebuilding on every
// request would pound the backend.
export const revalidate = 3600;

type SitemapEntry = MetadataRoute.Sitemap[number];

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: SitemapEntry["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/explore", priority: 0.9, changeFrequency: "hourly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contributing", priority: 0.5, changeFrequency: "monthly" },
  { path: "/architecture", priority: 0.5, changeFrequency: "monthly" },
  { path: "/plugins", priority: 0.5, changeFrequency: "weekly" },
  { path: "/guides", priority: 0.6, changeFrequency: "weekly" },
  { path: "/docs", priority: 0.6, changeFrequency: "weekly" },
  { path: "/docs/api", priority: 0.5, changeFrequency: "weekly" },
  { path: "/docs/sdk", priority: 0.5, changeFrequency: "weekly" },
  { path: "/docs/mcp", priority: 0.5, changeFrequency: "weekly" },
];

async function fetchPublicEntries(): Promise<SitemapEntry[]> {
  const results: SitemapEntry[] = [];
  let cursor: string | null = null;
  // Safety cap — if the loop ever fails to terminate (bad cursor response),
  // stop after 100 pages × 200 entries = 20k entries.
  let pages = 0;
  do {
    const page = await listEntries(200, cursor, {
      visibility: "public",
      sort: "updated_at",
      order: "desc",
    });
    for (const entry of page.items) {
      results.push({
        url: `${SITE_URL}/entries/${entry.id}`,
        lastModified: entry.updated_at ? new Date(entry.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    cursor = page.has_more ? page.next_cursor : null;
    pages += 1;
  } while (cursor && pages < 100);
  return results;
}

async function fetchGuides(): Promise<SitemapEntry[]> {
  const docs = await listDocs();
  return docs.map((doc) => ({
    url: `${SITE_URL}/guides/${doc.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Dynamic sections degrade gracefully — if the API is unreachable we
  // still return the static portion rather than 500-ing the whole sitemap.
  const [entries, guides] = await Promise.all([
    fetchPublicEntries().catch(() => [] as SitemapEntry[]),
    fetchGuides().catch(() => [] as SitemapEntry[]),
  ]);

  return [...staticEntries, ...guides, ...entries];
}
