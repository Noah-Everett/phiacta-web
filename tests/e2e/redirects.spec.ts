// phiacta-web-repo/tests/e2e/redirects.spec.ts
//
// E2E tests for redirect behavior — old /claims/* routes must redirect
// to /entries/* equivalents.

import { test, expect } from "@playwright/test";

test.describe("Claims to entries redirects", () => {
  // Scenario: A user visits /claims/some-uuid (old URL from before the rename)
  // and is redirected to /entries/some-uuid
  test("redirects /claims/{id} to /entries/{id}", async ({ page }) => {
    const testId = "11111111-2222-3333-4444-555555555555";

    // We expect a redirect, not a 404
    const response = await page.goto(`/claims/${testId}`);

    // After redirect, the URL should be /entries/{id}
    expect(page.url()).toContain(`/entries/${testId}`);
  });

  // Scenario: A user visits /claims (the old list page) and is redirected
  // to /explore or /entries
  test("redirects /claims to entries listing", async ({ page }) => {
    await page.goto("/claims");

    // Should redirect away from /claims
    expect(page.url()).not.toContain("/claims");
    // Should end up at either /explore or /entries
    const url = page.url();
    const isRedirected = url.includes("/explore") || url.includes("/entries");
    expect(isRedirected).toBe(true);
  });
});
