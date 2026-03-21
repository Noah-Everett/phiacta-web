// phiacta-web-repo/tests/e2e/landing-page.spec.ts
//
// E2E tests for the landing page — verifies "entries" terminology replaces
// "claims" throughout, and no dead API calls are made.

import { test, expect } from "@playwright/test";

test.describe("Landing page — terminology alignment", () => {
  // Scenario: A visitor loads the homepage and sees "entries" terminology,
  // not the old "claims" terminology anywhere on the page
  test("renders with entries terminology, no claims references", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/phiacta/i);

    // The page must load without errors
    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();

    // Must NOT contain "claims" (case-insensitive) as a concept reference.
    // Note: we check for the noun "claim" as used in the old UI, not the
    // English word in all contexts. We look specifically for patterns like
    // "Claims", "Browse Claims", "Submit a Claim", etc.
    const claimsPatterns = [
      "Browse Claims",
      "Submit a Claim",
      "Submit Claim",
      "Create Claim",
      "Your Claims",
      "All Claims",
      "ClaimType",
      "claim_type",
    ];
    for (const pattern of claimsPatterns) {
      expect(bodyText).not.toContain(pattern);
    }
  });

  // Scenario: The landing page links to the explore page using the correct route
  test("has navigation link to explore entries", async ({ page }) => {
    await page.goto("/");

    // Should have a link to explore/browse entries
    const exploreLink = page.locator('a[href*="/explore"]');
    // At least one link should exist that leads to entry exploration
    await expect(exploreLink.first()).toBeVisible();
  });

  // Scenario: No network requests are made to deprecated API endpoints
  test("makes no requests to deprecated /v1/claims endpoints", async ({
    page,
  }) => {
    const deprecatedRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (
        url.includes("/v1/claims") ||
        url.includes("/v1/namespaces") ||
        url.includes("/v1/sources") ||
        url.includes("/v1/search") ||
        url.includes("/layers/")
      ) {
        deprecatedRequests.push(url);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(deprecatedRequests).toEqual([]);
  });
});
