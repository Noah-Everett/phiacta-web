"use client";

import MarkdownContent from "@/components/MarkdownContent";

/**
 * Converts LaTeX formatting to Markdown so the existing Markdown+KaTeX
 * renderer can handle it. Math environments are preserved for KaTeX.
 *
 * Strategy: process math environments first (protect them from text
 * substitutions), then convert text formatting, then restore math.
 */
function latexToMarkdown(tex: string): string {
  // Step 1: Extract and protect math environments from text substitutions
  const mathBlocks: string[] = [];
  let md = tex;

  // Protect display math: \[...\], $$...$$, \begin{equation}...\end{equation}, etc.
  const mathEnvs = [
    /\$\$[\s\S]*?\$\$/g,
    /\\\[[\s\S]*?\\\]/g,
    /\\begin\{(equation|align|gather|multline|eqnarray|flalign|alignat)\*?\}[\s\S]*?\\end\{\1\*?\}/g,
  ];
  for (const re of mathEnvs) {
    md = md.replace(re, (match) => {
      mathBlocks.push(match);
      return `%%MATH${mathBlocks.length - 1}%%`;
    });
  }

  // Protect inline math: $...$  (not \$ escaped dollars)
  md = md.replace(/(?<!\\)\$([^$]+?)\$/g, (match) => {
    mathBlocks.push(match);
    return `%%MATH${mathBlocks.length - 1}%%`;
  });

  // Step 2: Document structure
  md = md.replace(/\\part\*?\{([^}]*)\}/g, "\n# $1\n");
  md = md.replace(/\\chapter\*?\{([^}]*)\}/g, "\n# $1\n");
  md = md.replace(/\\section\*?\{([^}]*)\}/g, "\n## $1\n");
  md = md.replace(/\\subsection\*?\{([^}]*)\}/g, "\n### $1\n");
  md = md.replace(/\\subsubsection\*?\{([^}]*)\}/g, "\n#### $1\n");
  md = md.replace(/\\paragraph\*?\{([^}]*)\}/g, "\n**$1** ");
  md = md.replace(/\\subparagraph\*?\{([^}]*)\}/g, "\n*$1* ");

  // Step 3: Text formatting (handle nested braces with non-greedy matching)
  md = md.replace(/\\textbf\{([^}]*)\}/g, "**$1**");
  md = md.replace(/\\textit\{([^}]*)\}/g, "*$1*");
  md = md.replace(/\\emph\{([^}]*)\}/g, "*$1*");
  md = md.replace(/\\texttt\{([^}]*)\}/g, "`$1`");
  md = md.replace(/\\textsc\{([^}]*)\}/g, "$1");  // small caps → uppercase text
  md = md.replace(/\\textsf\{([^}]*)\}/g, "$1");  // sans-serif → plain
  md = md.replace(/\\textrm\{([^}]*)\}/g, "$1");  // roman → plain
  md = md.replace(/\\textsl\{([^}]*)\}/g, "*$1*"); // slanted → italic
  md = md.replace(/\\textup\{([^}]*)\}/g, "$1");   // upright → plain
  md = md.replace(/\\underline\{([^}]*)\}/g, "$1");
  md = md.replace(/\\mbox\{([^}]*)\}/g, "$1");
  md = md.replace(/\\hbox\{([^}]*)\}/g, "$1");
  md = md.replace(/\\text\{([^}]*)\}/g, "$1");

  // Font style commands (without braces — affect rest of scope)
  md = md.replace(/\\bfseries\b/g, "");
  md = md.replace(/\\itshape\b/g, "");
  md = md.replace(/\\scshape\b/g, "");
  md = md.replace(/\\rmfamily\b/g, "");
  md = md.replace(/\\sffamily\b/g, "");
  md = md.replace(/\\ttfamily\b/g, "");
  md = md.replace(/\\normalfont\b/g, "");

  // Font sizes
  md = md.replace(/\\(tiny|scriptsize|footnotesize|small|normalsize|large|Large|LARGE|huge|Huge)\b/g, "");

  // Step 4: Lists
  md = md.replace(/\\begin\{itemize\}/g, "");
  md = md.replace(/\\end\{itemize\}/g, "");
  md = md.replace(/\\begin\{enumerate\}/g, "");
  md = md.replace(/\\end\{enumerate\}/g, "");
  md = md.replace(/\\begin\{description\}/g, "");
  md = md.replace(/\\end\{description\}/g, "");
  // \item[term] → **term**: for description lists
  md = md.replace(/\\item\[([^\]]*)\]\s*/g, "\n- **$1**: ");
  md = md.replace(/\\item\s*/g, "\n- ");

  // Step 5: Math environments → KaTeX-compatible markdown
  md = md.replace(/\\begin\{equation\*?\}/g, "\n$$");
  md = md.replace(/\\end\{equation\*?\}/g, "$$\n");
  md = md.replace(/\\begin\{align\*?\}/g, "\n$$\\begin{aligned}");
  md = md.replace(/\\end\{align\*?\}/g, "\\end{aligned}$$\n");
  md = md.replace(/\\begin\{gather\*?\}/g, "\n$$\\begin{gathered}");
  md = md.replace(/\\end\{gather\*?\}/g, "\\end{gathered}$$\n");
  md = md.replace(/\\begin\{multline\*?\}/g, "\n$$\\begin{gathered}");
  md = md.replace(/\\end\{multline\*?\}/g, "\\end{gathered}$$\n");
  md = md.replace(/\\\[/g, "\n$$");
  md = md.replace(/\\\]/g, "$$\n");

  // Step 6: Cross-references and citations
  md = md.replace(/\\href\{([^}]*)\}\{([^}]*)\}/g, "[$2]($1)");
  md = md.replace(/\\url\{([^}]*)\}/g, "[$1]($1)");
  md = md.replace(/\\footnote\{([^}]*)\}/g, " (*$1*)");
  md = md.replace(/\\cite[tp]?\*?\{([^}]*)\}/g, "[$1]");
  md = md.replace(/\\citep\{([^}]*)\}/g, "($1)");
  md = md.replace(/\\citet\{([^}]*)\}/g, "$1");
  md = md.replace(/\\ref\{([^}]*)\}/g, "[$1]");
  md = md.replace(/\\eqref\{([^}]*)\}/g, "(Eq. $1)");
  md = md.replace(/\\label\{[^}]*\}/g, "");
  md = md.replace(/\\autoref\{([^}]*)\}/g, "[$1]");
  md = md.replace(/\\cref\{([^}]*)\}/g, "[$1]");

  // Step 7: Figures, tables, and floats — extract caption, strip the rest
  md = md.replace(/\\begin\{(figure|table|float)\*?\}[\s\S]*?\\caption\{([^}]*)\}[\s\S]*?\\end\{\1\*?\}/g, "\n*$2*\n");
  md = md.replace(/\\begin\{(figure|table|float)\*?\}[\s\S]*?\\end\{\1\*?\}/g, "");
  md = md.replace(/\\includegraphics(\[[^\]]*\])?\{([^}]*)\}/g, "*[Figure: $2]*");
  md = md.replace(/\\caption\{([^}]*)\}/g, "*$1*");

  // Step 8: Theorem-like environments
  const thmEnvs = ["theorem", "lemma", "proposition", "corollary", "definition",
    "remark", "example", "proof", "conjecture", "observation", "claim", "fact",
    "notation", "assumption"];
  for (const env of thmEnvs) {
    const label = env.charAt(0).toUpperCase() + env.slice(1);
    const re = new RegExp(`\\\\begin\\{${env}\\*?\\}(\\[([^\\]]*)\\])?`, "g");
    md = md.replace(re, (_match, _g1, title) =>
      title ? `\n**${label}** (*${title}*)**.**` : `\n**${label}.**`
    );
    md = md.replace(new RegExp(`\\\\end\\{${env}\\*?\\}`, "g"), "\n");
  }

  // Step 9: Special characters
  md = md.replace(/\\&/g, "&");
  md = md.replace(/\\%/g, "%");
  md = md.replace(/\\#/g, "#");
  md = md.replace(/\\\$/g, "\\$");
  md = md.replace(/\\_/g, "_");
  md = md.replace(/\\textbackslash(\{\})?/g, "\\");
  md = md.replace(/\\ldots|\\dots/g, "...");
  md = md.replace(/---/g, "\u2014");  // em dash
  md = md.replace(/--/g, "\u2013");   // en dash
  md = md.replace(/``/g, "\u201C");   // left double quote
  md = md.replace(/''/g, "\u201D");   // right double quote
  md = md.replace(/`/g, "\u2018");    // left single quote
  md = md.replace(/'/g, "\u2019");    // right single quote (careful with contractions)

  // Step 10: Spacing and layout
  md = md.replace(/\\quad/g, "  ");
  md = md.replace(/\\qquad/g, "    ");
  md = md.replace(/\\[,;:!]/g, " ");
  md = md.replace(/\\hspace\*?\{[^}]*\}/g, " ");
  md = md.replace(/\\vspace\*?\{[^}]*\}/g, "\n");
  md = md.replace(/\\noindent\s*/g, "");
  md = md.replace(/\\newline/g, "\n");
  md = md.replace(/\\linebreak(\[\d\])?/g, "\n");
  md = md.replace(/\\par\b/g, "\n\n");
  md = md.replace(/\\clearpage|\\newpage|\\pagebreak/g, "\n\n---\n\n");
  md = md.replace(/\\bigskip|\\medskip|\\smallskip/g, "\n");
  md = md.replace(/\\\\(\[[^\]]*\])?/g, "\n"); // \\ with optional spacing

  // Step 11: Misc commands to strip
  md = md.replace(/\\centering/g, "");
  md = md.replace(/\\raggedright|\\raggedleft/g, "");
  md = md.replace(/\\maketitle/g, "");
  md = md.replace(/\\tableofcontents/g, "");
  md = md.replace(/\\bibliographystyle\{[^}]*\}/g, "");
  md = md.replace(/\\bibliography\{[^}]*\}/g, "");
  md = md.replace(/\\usepackage(\[[^\]]*\])?\{[^}]*\}/g, "");
  md = md.replace(/\\documentclass(\[[^\]]*\])?\{[^}]*\}/g, "");
  md = md.replace(/\\begin\{document\}/g, "");
  md = md.replace(/\\end\{document\}/g, "");
  md = md.replace(/\\begin\{abstract\}/g, "\n**Abstract.**\n");
  md = md.replace(/\\end\{abstract\}/g, "\n");
  md = md.replace(/\\title\{([^}]*)\}/g, "\n# $1\n");
  md = md.replace(/\\author\{([^}]*)\}/g, "\n*$1*\n");
  md = md.replace(/\\date\{([^}]*)\}/g, "*$1*\n");
  md = md.replace(/\\thanks\{([^}]*)\}/g, "");
  md = md.replace(/\\acknowledgments?/g, "\n## Acknowledgments\n");

  // Verbatim
  md = md.replace(/\\begin\{verbatim\}/g, "\n```");
  md = md.replace(/\\end\{verbatim\}/g, "```\n");
  md = md.replace(/\\verb\|([^|]*)\|/g, "`$1`");
  md = md.replace(/\\verb\+([^+]*)\+/g, "`$1`");

  // Quotes
  md = md.replace(/\\begin\{quote\}/g, "\n> ");
  md = md.replace(/\\end\{quote\}/g, "\n");
  md = md.replace(/\\begin\{quotation\}/g, "\n> ");
  md = md.replace(/\\end\{quotation\}/g, "\n");

  // Step 12: Clean up remaining \begin/\end we don't handle
  md = md.replace(/\\begin\{[^}]*\}/g, "");
  md = md.replace(/\\end\{[^}]*\}/g, "");

  // Strip remaining unknown commands (single backslash + word, no braces)
  // Be careful not to strip math commands — those are in protected blocks
  md = md.replace(/\\[a-zA-Z]+\{([^}]*)\}/g, "$1"); // \unknown{text} → text
  md = md.replace(/\\[a-zA-Z]+\b/g, ""); // \unknown → remove

  // ~ (non-breaking space) → regular space
  md = md.replace(/~/g, " ");

  // Step 13: Restore protected math blocks
  md = md.replace(/%%MATH(\d+)%%/g, (_match, idx) => {
    const block = mathBlocks[parseInt(idx)];
    // Convert \[...\] to $$...$$ for KaTeX
    if (block.startsWith("\\[")) {
      return "\n$$" + block.slice(2, -2) + "$$\n";
    }
    // Convert \begin{equation} etc to $$
    return block
      .replace(/\\begin\{equation\*?\}/, "\n$$")
      .replace(/\\end\{equation\*?\}/, "$$\n")
      .replace(/\\begin\{align\*?\}/, "\n$$\\begin{aligned}")
      .replace(/\\end\{align\*?\}/, "\\end{aligned}$$\n");
  });

  // Step 14: Clean up whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.replace(/[ \t]+\n/g, "\n"); // trailing whitespace

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
