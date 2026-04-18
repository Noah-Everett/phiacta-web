import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getDoc } from "@/lib/api";
import { SITE_URL, DEFAULT_DESCRIPTION } from "@/lib/seo";

/**
 * Server-component wrapper around the client guide page. Its only job is
 * to expose server-side generateMetadata so each guide has a distinct,
 * indexable title and description.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const url = `${SITE_URL}/guides/${slug}`;
  try {
    const doc = await getDoc(slug);
    const title = doc.name;
    const description = doc.description || DEFAULT_DESCRIPTION;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        title,
        description,
        url,
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "Guide",
      description: DEFAULT_DESCRIPTION,
      alternates: { canonical: url },
    };
  }
}

export default function GuideLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
