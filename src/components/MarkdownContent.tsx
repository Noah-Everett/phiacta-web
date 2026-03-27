"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type { Components } from "react-markdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const UUID_RE = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

// Matches /entries/UUID or /users/UUID in href
const ENTITY_PATH_RE = new RegExp(`^\\/(entries|users)\\/(${UUID_RE})$`, "i");

// Extracts all entity UUIDs from markdown link syntax
const ENTITY_LINK_SCAN_RE = new RegExp(`\\]\\(\\/(entries|users)\\/(${UUID_RE})\\)`, "gi");

interface MarkdownContentProps {
  content: string;
  className?: string;
  entryId?: string;
}

function isRelativeUrl(src: string): boolean {
  return !src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("data:");
}

/**
 * Resolve a relative image path to the entry file API.
 *
 * Strips leading `./` and `/` so the path is clean for the API, and
 * encodes each path segment to handle spaces and special characters.
 */
function resolveEntryImageUrl(src: string, entryId: string): string {
  let path = src;
  // Strip leading "./" — markdown relative paths
  while (path.startsWith("./")) path = path.slice(2);
  // Strip leading "/" — treat as repo-root-relative
  while (path.startsWith("/")) path = path.slice(1);
  // Encode each segment individually so slashes are preserved
  const encoded = path
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${API_URL}/v1/entries/${entryId}/files/${encoded}`;
}

/**
 * Markdown parsers (micromark) don't handle spaces in link/image URLs.
 * Wrap paths containing spaces in angle brackets so the parser
 * recognises them: `[text](<path with spaces>)`
 */
function preprocessLinkPaths(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\(([^)<>]+\s[^)<>]+)\)/g, (_, alt, url) => `![${alt}](<${url}>)`)
    .replace(/(?<!!)\[([^\]]*)\]\(([^)<>]+\s[^)<>]+)\)/g, (_, text, url) => `[${text}](<${url}>)`);
}

export default function MarkdownContent({
  content,
  className,
  entryId,
}: MarkdownContentProps) {
  const [brokenLinks, setBrokenLinks] = useState<Set<string>>(new Set());

  // Validate all /entries/UUID links in content
  useEffect(() => {
    const ids = new Set<string>();
    let match;
    const re = new RegExp(ENTITY_LINK_SCAN_RE.source, "gi");
    while ((match = re.exec(content)) !== null) {
      ids.add(match[2]);
    }
    if (ids.size === 0) return;

    (async () => {
      const broken = new Set<string>();
      for (const id of ids) {
        try {
          const res = await fetch(`${API_URL}/v1/entities/${id}`, { cache: "no-store" });
          if (!res.ok) broken.add(id);
        } catch {
          broken.add(id);
        }
      }
      setBrokenLinks(broken);
    })();
  }, [content]);

  const components: Components = {
    a: ({ href, children, ...props }) => {
      if (!href) return <a {...props}>{children}</a>;

      const entityMatch = href.match(ENTITY_PATH_RE);
      if (entityMatch) {
        const id = entityMatch[2];
        if (brokenLinks.has(id)) {
          return (
            <span className="inline-flex items-center gap-1 text-destructive" title={`Entry ${id} not found`}>
              <AlertTriangle className="inline h-3 w-3" />
              <span className="line-through">{children}</span>
            </span>
          );
        }
        return (
          <Link href={href} className="text-primary hover:underline">
            {children}
          </Link>
        );
      }

      // Relative file links — link to the website's file viewer page
      if (entryId && isRelativeUrl(href)) {
        let path = href;
        while (path.startsWith("./")) path = path.slice(2);
        while (path.startsWith("/")) path = path.slice(1);
        const encoded = path.split("/").map((seg) => encodeURIComponent(seg)).join("/");
        return (
          <Link href={`/entries/${entryId}/files/${encoded}`} className="text-primary hover:underline">
            {children}
          </Link>
        );
      }

      // Regular external/internal links
      return <a href={href} {...props}>{children}</a>;
    },
    ...(entryId
      ? {
          img: ({ src, alt, ...props }) => {
            const resolvedSrc =
              typeof src === "string" && isRelativeUrl(src)
                ? resolveEntryImageUrl(src, entryId)
                : src;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolvedSrc}
                alt={alt || ""}
                className="max-w-full rounded-lg"
                loading="lazy"
                {...props}
              />
            );
          },
        }
      : {}),
  };

  return (
    <div className={cn("prose prose-sm prose-gray dark:prose-invert max-w-none", className)}>
      {brokenLinks.size > 0 && (
        <div className="not-prose mb-4 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            {brokenLinks.size} broken entry link{brokenLinks.size > 1 ? "s" : ""} in this content
          </span>
        </div>
      )}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {preprocessLinkPaths(content)}
      </ReactMarkdown>
    </div>
  );
}
