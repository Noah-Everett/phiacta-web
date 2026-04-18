import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getUser } from "@/lib/api";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

/**
 * Server-component wrapper around the client user profile page. Its only
 * job is to expose server-side generateMetadata so crawlers and link
 * previews see the actual username instead of the root metadata.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const url = `${SITE_URL}/users/${id}`;
  try {
    const user = await getUser(id);
    const title = `@${user.username}`;
    const description = `${user.username}'s entries, issues, and proposed edits on ${SITE_NAME}.`;
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "profile",
        title,
        description,
        url,
        username: user.username,
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "User",
      description: `A contributor on ${SITE_NAME}.`,
      alternates: { canonical: url },
    };
  }
}

export default function UserLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
