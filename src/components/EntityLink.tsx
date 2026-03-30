"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { resolveEntity } from "@/lib/api";

interface EntityLinkProps {
  id: string;
  /** Fallback text when entity type is unknown or still loading. */
  children?: React.ReactNode;
  className?: string;
}

const ROUTE_MAP: Record<string, (id: string) => string> = {
  entry: (id) => `/entries/${id}`,
  user: (id) => `/users/${id}`,
};

/**
 * Resolves a UUID to its entity type and renders a link to the right page.
 * Falls back to displaying the UUID (or children) as plain text if resolution fails.
 */
export default function EntityLink({ id, children, className }: EntityLinkProps) {
  const [resolved, setResolved] = useState<{ type: string; label: string } | null>(null);

  useEffect(() => {
    resolveEntity(id)
      .then((data) => {
        const type = data.entity_type as string;
        const label =
          type === "entry" ? (data.title as string) || id.slice(0, 8)
          : type === "user" ? (data.username as string) || id.slice(0, 8)
          : id.slice(0, 8);
        setResolved({ type, label });
      })
      .catch(() => {});
  }, [id]);

  if (!resolved) {
    return <span className={className}>{children || id.slice(0, 8)}</span>;
  }

  const href = ROUTE_MAP[resolved.type]?.(id);
  if (!href) {
    return <span className={className}>{resolved.label}</span>;
  }

  return (
    <Link href={href} className={className || "text-primary hover:underline"}>
      {children || resolved.label}
    </Link>
  );
}
