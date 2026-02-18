"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownContentProps {
  content: string;
  compact?: boolean;
  className?: string;
}

function truncatePreservingMath(text: string, max: number): string {
  if (text.length <= max) return text;

  let truncated = text.slice(0, max);

  // Count unclosed $ delimiters
  const dollars = (truncated.match(/\$/g) || []).length;
  if (dollars % 2 !== 0) {
    // Find the last $ and cut before it
    const lastDollar = truncated.lastIndexOf("$");
    truncated = truncated.slice(0, lastDollar);
  }

  return truncated.trimEnd() + "...";
}

const compactComponents = {
  // Prevent block elements in compact mode
  h1: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  h2: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  h3: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  h4: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  h5: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  h6: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  p: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  blockquote: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  ul: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  ol: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  li: ({ children }: { children?: React.ReactNode }) => <span>{children} </span>,
  // Convert links to spans to avoid nested <a> inside <Link>
  a: ({ children }: { children?: React.ReactNode }) => (
    <span className="text-blue-600 underline">{children}</span>
  ),
};

export default function MarkdownContent({
  content,
  compact,
  className,
}: MarkdownContentProps) {
  if (compact) {
    const truncated = truncatePreservingMath(content, 200);
    return (
      <div className={className}>
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={compactComponents}
        >
          {truncated}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={`prose prose-sm prose-gray max-w-none ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
