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

  // Track math delimiters to find unclosed blocks
  let i = 0;
  let lastUnclosedStart = -1;
  let inDisplay = false;
  let inInline = false;

  while (i < truncated.length) {
    if (truncated[i] === "$" && i + 1 < truncated.length && truncated[i + 1] === "$") {
      if (inDisplay) {
        inDisplay = false;
        lastUnclosedStart = -1;
        i += 2;
      } else if (!inInline) {
        inDisplay = true;
        lastUnclosedStart = i;
        i += 2;
      } else {
        i += 1;
      }
    } else if (truncated[i] === "$") {
      if (inInline) {
        inInline = false;
        lastUnclosedStart = -1;
        i += 1;
      } else if (!inDisplay) {
        inInline = true;
        lastUnclosedStart = i;
        i += 1;
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
  }

  if ((inDisplay || inInline) && lastUnclosedStart >= 0) {
    truncated = truncated.slice(0, lastUnclosedStart);
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
    <span className="text-blue-600 underline dark:text-blue-400">{children}</span>
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
    <div className={`prose prose-sm prose-gray dark:prose-invert max-w-none ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
