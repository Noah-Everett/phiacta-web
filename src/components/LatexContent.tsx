"use client";

import MarkdownContent from "@/components/MarkdownContent";

/**
 * Converts common LaTeX formatting to Markdown so the existing
 * Markdown+KaTeX renderer can handle it. Leaves math environments
 * intact since KaTeX already renders those.
 */
function latexToMarkdown(tex: string): string {
  let md = tex;

  // \textbf{...} → **...**
  md = md.replace(/\\textbf\{([^}]*)\}/g, "**$1**");
  // \textit{...} → *...*
  md = md.replace(/\\textit\{([^}]*)\}/g, "*$1*");
  // \emph{...} → *...*
  md = md.replace(/\\emph\{([^}]*)\}/g, "*$1*");
  // \texttt{...} → `...`
  md = md.replace(/\\texttt\{([^}]*)\}/g, "`$1`");
  // \underline{...} → just the text (no markdown equivalent)
  md = md.replace(/\\underline\{([^}]*)\}/g, "$1");

  // \section{...} → ## ...
  md = md.replace(/\\section\*?\{([^}]*)\}/g, "\n## $1\n");
  // \subsection{...} → ### ...
  md = md.replace(/\\subsection\*?\{([^}]*)\}/g, "\n### $1\n");
  // \subsubsection{...} → #### ...
  md = md.replace(/\\subsubsection\*?\{([^}]*)\}/g, "\n#### $1\n");

  // \begin{itemize}...\end{itemize} → bullet list
  md = md.replace(/\\begin\{itemize\}/g, "");
  md = md.replace(/\\end\{itemize\}/g, "");
  // \begin{enumerate}...\end{enumerate} → numbered list
  md = md.replace(/\\begin\{enumerate\}/g, "");
  md = md.replace(/\\end\{enumerate\}/g, "");
  // \item → - (bullet)
  md = md.replace(/\\item\s*/g, "\n- ");

  // \begin{equation}...\end{equation} → $$...$$ (KaTeX handles these)
  md = md.replace(/\\begin\{equation\*?\}/g, "\n$$");
  md = md.replace(/\\end\{equation\*?\}/g, "$$\n");
  // \begin{align}...\end{align} → $$\begin{aligned}...$$
  md = md.replace(/\\begin\{align\*?\}/g, "\n$$\\begin{aligned}");
  md = md.replace(/\\end\{align\*?\}/g, "\\end{aligned}$$\n");

  // \[ ... \] → $$ ... $$
  md = md.replace(/\\\[/g, "\n$$");
  md = md.replace(/\\\]/g, "$$\n");

  // \href{url}{text} → [text](url)
  md = md.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, "[$2]($1)");

  // \footnote{...} → (footnote: ...)
  md = md.replace(/\\footnote\{([^}]*)\}/g, " (*$1*)");

  // \cite{...} → [ref]
  md = md.replace(/\\cite\{([^}]*)\}/g, "[$1]");

  // Clean up remaining \begin/\end that we don't handle
  md = md.replace(/\\begin\{[^}]*\}/g, "");
  md = md.replace(/\\end\{[^}]*\}/g, "");

  // \\ (line break) → newline
  md = md.replace(/\\\\/g, "\n");

  // ~ (non-breaking space) → regular space
  md = md.replace(/~/g, " ");

  // Clean up multiple blank lines
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

interface LatexContentProps {
  content: string;
  className?: string;
  entryId?: string;
}

export default function LatexContent({ content, className, entryId }: LatexContentProps) {
  const markdown = latexToMarkdown(content);
  return (
    <MarkdownContent
      content={markdown}
      className={className}
      entryId={entryId}
    />
  );
}
