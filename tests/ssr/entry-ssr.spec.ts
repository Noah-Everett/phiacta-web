// SSR e2e: prove that a public entry's title and rendered body are in the
// INITIAL server HTML — with no JavaScript executed — while a private
// entry's title and body are not.
//
// We fetch the page over plain HTTP (request fixture, no browser, no JS) so
// what we assert on is exactly what a crawler / link-unfurler / LLM web
// reader / `curl` would receive. The Next server is pointed at a mock API
// (see playwright.ssr.config.ts) so SSR data fetching is deterministic.

import { test, expect } from "@playwright/test";
import {
  PUBLIC_ID,
  PRIVATE_ID,
  PUBLIC_TITLE,
  PUBLIC_BODY_MARKER,
  PRIVATE_TITLE,
  PRIVATE_BODY_MARKER,
} from "./fixtures.mjs";

test.describe("Entry page SSR (no JavaScript)", () => {
  test("public entry: title and rendered body are in the initial HTML", async ({
    request,
  }) => {
    const res = await request.get(`/entries/${PUBLIC_ID}`);
    expect(res.status()).toBe(200);

    const html = await res.text();

    // The body marker only exists inside content.md — its presence proves
    // the entry body was server-rendered, not just <head> metadata.
    expect(html).toContain(PUBLIC_BODY_MARKER);
    // The real title is rendered into the document, not skeletoned away.
    expect(html).toContain(PUBLIC_TITLE);
    // And it is rendered as prose (markdown heading), not as a fallback.
    expect(html).not.toContain("No rendered content available");
  });

  test("private entry: title and body are NOT in the initial HTML", async ({
    request,
  }) => {
    const res = await request.get(`/entries/${PRIVATE_ID}`);
    expect(res.status()).toBe(200);

    const html = await res.text();

    // Even though the mock backend hands back private metadata
    // unauthenticated, the layout's visibility gate must keep it out of the
    // server HTML.
    expect(html).not.toContain(PRIVATE_TITLE);
    expect(html).not.toContain(PRIVATE_BODY_MARKER);
  });
});
