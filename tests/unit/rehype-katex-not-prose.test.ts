// Unit tests for the rehype plugin that marks KaTeX display-math
// wrappers with `not-prose` so Tailwind Typography skips them.

import { describe, it, expect } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";

import rehypeKatexNotProse from "@/lib/rehype-katex-not-prose";

const render = async (md: string): Promise<string> => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeKatexNotProse)
    .use(rehypeStringify);
  return String(await processor.process(md));
};

describe("rehypeKatexNotProse", () => {
  it("adds not-prose to .katex-display wrappers", async () => {
    const html = await render("$$\nx^2 + y^2 = z^2\n$$");
    // The display wrapper carries both classes.
    expect(html).toMatch(/class="katex-display not-prose"|class="not-prose katex-display"/);
  });

  it("does NOT add not-prose to inline .katex spans", async () => {
    const html = await render("inline $x^2$ math");
    // Find every <span class="katex"...> opening tag and ensure none
    // also carry not-prose.
    const inlineMatches = html.match(/<span class="katex[^"]*"/g) ?? [];
    const displayMatches = inlineMatches.filter((m) => m.includes("katex-display"));
    const trulyInline = inlineMatches.filter((m) => !m.includes("katex-display"));
    expect(displayMatches).toHaveLength(0);
    expect(trulyInline.length).toBeGreaterThan(0);
    for (const m of trulyInline) {
      expect(m).not.toContain("not-prose");
    }
  });

  it("handles a tagged display equation without overlap (class is present)", async () => {
    const html = await render(String.raw`$$
B_{ij,l}(g) = B_{ij,l}(\gamma) + 2\xi H_{ij} \ell_l. \tag{A.1}
$$`);
    expect(html).toContain("katex-display");
    expect(html).toContain("not-prose");
    // KaTeX emits a <span class="tag"> for \tag{N}
    expect(html).toContain('class="tag');
  });

  it("is idempotent — re-running does not double-add not-prose", async () => {
    // Two passes via the processor: in practice the plugin runs once
    // per render, but verify the guard if a future pipeline runs it twice.
    const processor = unified()
      .use(remarkParse)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeKatex)
      .use(rehypeKatexNotProse)
      .use(rehypeKatexNotProse)
      .use(rehypeStringify);
    const html = String(await processor.process("$$\nx\n$$"));
    // Exactly one occurrence of not-prose per display wrapper.
    expect(html.match(/not-prose/g)?.length).toBe(1);
  });
});
