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
 * Code (fenced ```...``` and inline `...`) is stashed first so embedded
 * `$$` examples in documentation aren't rewritten.
 */
export function preprocessDisplayMath(md: string): string {
  // Stash all code regions behind placeholders, transform the rest,
  // then restore. Using the NUL character as the placeholder boundary
  // since it never appears in markdown content.
  const stashed: string[] = [];
  const PLACEHOLDER = (i: number) => `\x00CODE${i}\x00`;

  const protect = (m: string): string => {
    stashed.push(m);
    return PLACEHOLDER(stashed.length - 1);
  };

  let working = md
    // Fenced code blocks first so we don't accidentally pick up backticks
    // inside them as inline spans.
    .replace(/```[\s\S]*?```/g, protect)
    // Inline code spans: matching backtick runs of any length. The
    // `(?!\1)` look-ahead lets the body contain shorter backtick runs.
    .replace(/(`+)((?:(?!\1)[\s\S])+?)\1/g, protect);

  // Matches `$$X$$` where X contains no `$` and no newline. The
  // non-greedy `+?` plus the negated character class keeps each pair
  // independent so multiple inline displays on one line each match.
  working = working.replace(/\$\$([^$\n]+?)\$\$/g, (_, body) => `\n\n$$\n${body.trim()}\n$$\n\n`);

  return working.replace(/\x00CODE(\d+)\x00/g, (_, i) => stashed[Number(i)]);
}
