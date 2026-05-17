// Unit tests for the markdown preprocessors that run before react-markdown.

import { describe, it, expect } from "vitest";

import {
  preprocessDisplayMath,
  preprocessLinkPaths,
} from "@/lib/markdown-preprocess";

describe("preprocessLinkPaths", () => {
  it("wraps a link URL containing a space in angle brackets", () => {
    const input = "see [the file](my notes/foo.md) here";
    expect(preprocessLinkPaths(input)).toBe("see [the file](<my notes/foo.md>) here");
  });

  it("wraps an image src containing a space in angle brackets", () => {
    const input = "![alt](my folder/img.png)";
    expect(preprocessLinkPaths(input)).toBe("![alt](<my folder/img.png>)");
  });

  it("leaves URLs without spaces alone", () => {
    const input = "[foo](bar.md) and ![x](y.png)";
    expect(preprocessLinkPaths(input)).toBe(input);
  });

  it("does not double-wrap an already-wrapped URL", () => {
    const input = "[foo](<already wrapped.md>)";
    expect(preprocessLinkPaths(input)).toBe(input);
  });
});

describe("preprocessDisplayMath", () => {
  it("converts single-line $$X$$ to block form", () => {
    const out = preprocessDisplayMath("$$x^2$$");
    expect(out).toContain("$$\nx^2\n$$");
  });

  it("breaks a mid-paragraph $$X$$ onto its own block", () => {
    const out = preprocessDisplayMath("Euler: $$e^{i\\pi} + 1 = 0$$ is famous.");
    // After normalization, the line break makes it a new block.
    expect(out).toMatch(/Euler:\s*\n\n\$\$\ne\^\{i\\pi\} \+ 1 = 0\n\$\$\n\n\s*is famous\./);
  });

  it("expands multiple inline $$ on one line independently", () => {
    const out = preprocessDisplayMath("text $$A$$ middle $$B$$ end");
    expect(out.match(/\$\$\nA\n\$\$/g)?.length).toBe(1);
    expect(out.match(/\$\$\nB\n\$\$/g)?.length).toBe(1);
  });

  it("leaves already-block-form $$\\nX\\n$$ untouched", () => {
    const input = "before\n\n$$\nx^2\n$$\n\nafter";
    expect(preprocessDisplayMath(input)).toBe(input);
  });

  it("does not touch single-dollar inline math", () => {
    const input = "an inline $x^2$ in text";
    expect(preprocessDisplayMath(input)).toBe(input);
  });

  it("does not touch $$ inside fenced code blocks", () => {
    const input = "before\n\n```markdown\n$$x^2$$\n```\n\nafter";
    expect(preprocessDisplayMath(input)).toBe(input);
  });

  it("does not touch $$ inside an inline code span", () => {
    const input = "the syntax `$$x^2$$` produces display math";
    expect(preprocessDisplayMath(input)).toBe(input);
  });

  it("does not touch $$ inside a multi-backtick inline span", () => {
    const input = "use ``$$x``$$ for special cases";
    expect(preprocessDisplayMath(input)).toBe(input);
  });

  it("processes $$ outside the code span but not inside", () => {
    const input = "outside $$a$$ then `$$b$$` then $$c$$";
    const out = preprocessDisplayMath(input);
    expect(out).toContain("$$\na\n$$");
    expect(out).toContain("$$\nc\n$$");
    expect(out).toContain("`$$b$$`");
    expect(out).not.toContain("$$\nb\n$$");
  });

  it("still processes $$ before and after a code block", () => {
    const input = "intro $$a$$\n\n```js\n$$x$$\n```\n\noutro $$b$$";
    const out = preprocessDisplayMath(input);
    expect(out).toContain("$$\na\n$$");
    expect(out).toContain("$$\nb\n$$");
    // The code block content stays literal.
    expect(out).toContain("```js\n$$x$$\n```");
  });

  it("handles two displays separated only by a newline", () => {
    const input = "intro: $$A$$\n$$B$$";
    const out = preprocessDisplayMath(input);
    expect(out.match(/\$\$\nA\n\$\$/g)?.length).toBe(1);
    expect(out.match(/\$\$\nB\n\$\$/g)?.length).toBe(1);
  });

  it("trims internal whitespace inside the captured body", () => {
    const out = preprocessDisplayMath("$$  x + y  $$");
    expect(out).toContain("$$\nx + y\n$$");
  });
});
