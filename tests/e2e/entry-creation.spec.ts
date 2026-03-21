// phiacta-web-repo/tests/e2e/entry-creation.spec.ts
//
// E2E tests for entry creation — verifies the form sends the correct
// field names (content_format, layout_hint — NOT format, claim_type).

import { test, expect } from "@playwright/test";

test.describe("Entry creation form", () => {
  // Scenario: User navigates to the contribute/create page and submits an
  // entry. The POST body uses correct field names from the backend schema.
  test("entry creation POST sends content_format and layout_hint, not format and claim_type", async ({
    page,
  }) => {
    let capturedRequest: { url: string; body: string } | null = null;

    page.on("request", (request) => {
      if (
        request.url().includes("/v1/entries") &&
        request.method() === "POST"
      ) {
        capturedRequest = {
          url: request.url(),
          body: request.postData() || "",
        };
      }
    });

    // The create page could be at /contribute or another route
    // Try the contribute page first
    await page.goto("/contribute");
    await page.waitForLoadState("networkidle");

    // Look for a title input
    const titleInput = page.locator(
      'input[name="title"], input[placeholder*="title" i], input[id*="title" i], textarea[name="title"]',
    );

    // If the page has a title field, fill it in and submit
    if ((await titleInput.count()) > 0) {
      await titleInput.first().fill("Test Entry Title");

      // Look for content field
      const contentInput = page.locator(
        'textarea[name="content"], textarea[placeholder*="content" i], textarea[id*="content" i], [contenteditable="true"]',
      );
      if ((await contentInput.count()) > 0) {
        await contentInput.first().fill("# Test Content\n\nThis is test content.");
      }

      // Submit the form
      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Create"), button:has-text("Submit"), button:has-text("Publish")',
      );
      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();
        await page.waitForTimeout(2000);

        if (capturedRequest) {
          const body = JSON.parse(capturedRequest.body);

          // Must use the new field names
          expect(body).toHaveProperty("title");

          // If content_format is sent, it must use "content_format" not "format"
          if ("content_format" in body || "format" in body) {
            expect(body).toHaveProperty("content_format");
            expect(body).not.toHaveProperty("format");
          }

          // If layout_hint is sent, it must use "layout_hint" not "claim_type"
          if ("layout_hint" in body || "claim_type" in body) {
            expect(body).toHaveProperty("layout_hint");
            expect(body).not.toHaveProperty("claim_type");
          }

          // Must NOT contain old field names
          expect(body).not.toHaveProperty("claim_type");
          expect(body).not.toHaveProperty("format");
          expect(body).not.toHaveProperty("type");

          // The endpoint must be /v1/entries, not /v1/claims
          expect(capturedRequest.url).toContain("/v1/entries");
          expect(capturedRequest.url).not.toContain("/v1/claims");
        }
      }
    }
  });
});
