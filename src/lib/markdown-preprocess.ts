/**
 * Preprocessors run on raw markdown before react-markdown sees it.
 *
 * Each function is pure (string in, string out) so it can be unit-tested
 * without rendering anything.
 */

/**
 * Wrap link/image paths containing spaces in angle brackets.
 *
 * micromark doesn't recognise `[text](path with spaces)` as a link —
 * the space terminates the URL. Authors don't expect that, so we
 * rewrite to `[text](<path with spaces>)` which micromark accepts.
 */
export function preprocessLinkPaths(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\(([^)<>]+\s[^)<>]+)\)/g, (_, alt, url) => `![${alt}](<${url}>)`)
    .replace(/(?<!!)\[([^\]]*)\]\(([^)<>]+\s[^)<>]+)\)/g, (_, text, url) => `[${text}](<${url}>)`);
}

/**
 * Normalize single-line `$$X$$` to block form so remark-math treats it
 * as display math.
 *
 * remark-math v6 only emits `katex-display` (centered, block-level KaTeX)
 * when `$$` is on its own line with the math content between newlines:
 *
 *     $$
 *     x^2
 *     $$
 *
 * If an author writes `$$x^2$$` on a single line — even surrounded by
 * blank lines — the parser falls back to inline math and the result
 * sits in the paragraph flow with no `.katex-display` wrapper. Most
 * other markdown ecosystems (Pandoc, MathJax, GitHub, Obsidian) treat
 * `$$x$$` as display regardless of position, so authors regularly hit
 * this. We rewrite inline `$$X$$` to the block form before parsing.
 *
 * Code blocks (fenced with ```) are skipped so embedded `$$` examples
 * in documentation entries aren't disturbed.
 */
export function preprocessDisplayMath(md: string): string {
  // Split on fenced code blocks. Even-indexed segments are prose,
  // odd-indexed are code blocks (preserved as-is).
  const FENCE_RE = /(^|\n)(```[^\n]*\n[\s\S]*?\n```)(?=\n|$)/g;
  const parts: string[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = FENCE_RE.exec(md)) !== null) {
    parts.push(md.slice(last, match.index + match[1].length));
    parts.push(match[2]);
    last = match.index + match[0].length;
  }
  parts.push(md.slice(last));

  // Matches `$$X$$` where X contains no `$` and no newline. The
  // non-greedy `+?` plus the negated character class keeps each pair
  // independent so multiple inline displays on one line each match.
  const INLINE_DISPLAY_RE = /\$\$([^$\n]+?)\$\$/g;

  return parts
    .map((segment, i) => {
      // Odd indices are code blocks — leave them alone.
      if (i % 2 === 1) return segment;
      return segment.replace(INLINE_DISPLAY_RE, (_, body) => `\n\n$$\n${body.trim()}\n$$\n\n`);
    })
    .join("");
}
