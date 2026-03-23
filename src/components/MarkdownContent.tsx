"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import type { Components } from "react-markdown";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MarkdownContentProps {
  content: string;
  className?: string;
  /** When set, relative image URLs are resolved via the entry file API. */
  entryId?: string;
}

function isRelativeUrl(src: string): boolean {
  return !src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("data:");
}

export default function MarkdownContent({
  content,
  className,
  entryId,
}: MarkdownContentProps) {
  const components: Components | undefined = entryId
    ? {
        img: ({ src, alt, ...props }) => {
          const resolvedSrc =
            src && isRelativeUrl(src)
              ? `${API_URL}/v1/entries/${entryId}/files/${src}`
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
    : undefined;

  return (
    <div className={cn("prose prose-sm prose-gray dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
