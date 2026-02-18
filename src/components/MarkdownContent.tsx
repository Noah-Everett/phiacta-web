"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkMath from "remark-math";
import { MathJax } from "better-react-mathjax";

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

function isMathInline(className?: string) {
  return className?.includes("math-inline");
}

function isMathDisplay(className?: string) {
  return className?.includes("math-display");
}

const fullComponents: Components = {
  code({ className, children }) {
    if (isMathInline(className)) {
      return <MathJax inline>{`$${String(children)}$`}</MathJax>;
    }
    if (isMathDisplay(className)) {
      return <MathJax>{`$$${String(children)}$$`}</MathJax>;
    }
    return <code className={className}>{children}</code>;
  },
  pre({ children }) {
    return <>{children}</>;
  },
};

const compactComponents: Components = {
  code({ className, children }) {
    if (isMathInline(className)) {
      return <MathJax inline>{`$${String(children)}$`}</MathJax>;
    }
    if (isMathDisplay(className)) {
      return <MathJax inline>{`$${String(children)}$`}</MathJax>;
    }
    return <code className={className}>{children}</code>;
  },
  pre({ children }) {
    return <>{children}</>;
  },
  // Prevent block elements in compact mode
  h1: ({ children }) => <span>{children} </span>,
  h2: ({ children }) => <span>{children} </span>,
  h3: ({ children }) => <span>{children} </span>,
  h4: ({ children }) => <span>{children} </span>,
  h5: ({ children }) => <span>{children} </span>,
  h6: ({ children }) => <span>{children} </span>,
  p: ({ children }) => <span>{children} </span>,
  blockquote: ({ children }) => <span>{children} </span>,
  ul: ({ children }) => <span>{children} </span>,
  ol: ({ children }) => <span>{children} </span>,
  li: ({ children }) => <span>{children} </span>,
  // Convert links to spans to avoid nested <a> inside <Link>
  a: ({ children }) => (
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
        components={fullComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
