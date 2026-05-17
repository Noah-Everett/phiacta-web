/**
 * Adds `not-prose` to KaTeX display-math wrappers so Tailwind Typography
 * leaves them alone.
 *
 * KaTeX ships a carefully-tuned layout (display: block, table-based
 * positioning for `\tag`, vlist stacking for sub/superscripts, etc.).
 * Tailwind Typography's `prose` wrapper aggressively styles every
 * descendant, which clobbers that layout in subtle ways — the most
 * recent victim was `\tag{N}` ending up overlapping the equation
 * because the .katex wrapper got shrunk to fit and the tag's
 * `position: absolute; right: 0` then anchored to the equation
 * instead of the full container.
 *
 * Instead of patching each KaTeX rule at higher CSS specificity (a
 * losing game — there are dozens), we tag display-math wrappers with
 * `not-prose`. Tailwind Typography writes its prose rules as
 * `:not(:where(.not-prose, .not-prose *))`, so the whole KaTeX
 * subtree is excluded and KaTeX's stock CSS takes over unmodified.
 *
 * Inline math (`.katex` without `.katex-display`) is left unmarked so
 * it keeps inheriting the surrounding paragraph's line-height and
 * baseline alignment.
 */

import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

const rehypeKatexNotProse: Plugin<[], Root> = () => (tree) => {
  visit(tree, "element", (node: Element) => {
    const classes = node.properties?.className;
    if (!Array.isArray(classes)) return;
    if (classes.includes("katex-display") && !classes.includes("not-prose")) {
      classes.push("not-prose");
    }
  });
};

export default rehypeKatexNotProse;
