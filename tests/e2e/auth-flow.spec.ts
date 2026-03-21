// phiacta-web-repo/tests/e2e/auth-flow.spec.ts
//
// E2E tests for the authentication flow — verifies that registration sends
// "handle" (not "name"), login works, and the auth state persists.

import { test, expect } from "@playwright/test";

test.describe("Registration flow", () => {
  // Scenario: User visits /auth/signup and sees a form with handle, email,
  // and password fields (not a "name" field)
  test("signup page has handle field, not name field", async ({ page }) => {
    await page.goto("/auth/signup");

    // Must have a handle input (not name)
    const handleInput = page.locator(
      'input[name="handle"], input[placeholder*="handle" i], input[id*="handle" i]',
    );
    await expect(handleInput.first()).toBeVisible();

    // Must NOT have a "name" field (the old schema)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveCount(0);

    // Must have email and password
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput.first()).toBeVisible();

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    await expect(passwordInput.first()).toBeVisible();
  });

  // Scenario: User submits the registration form and the request body contains
  // "handle" not "name", and hits /v1/auth/register
  test("registration POST sends handle, email, password to /v1/auth/register", async ({
    page,
  }) => {
    let capturedRequest: { url: string; body: string } | null = null;

    page.on("request", (request) => {
      if (request.url().includes("/auth/register") && request.method() === "POST") {
        capturedRequest = {
          url: request.url(),
          body: request.postData() || "",
        };
      }
    });

    await page.goto("/auth/signup");

    // Fill in the form
    const handleInput = page.locator(
      'input[name="handle"], input[placeholder*="handle" i], input[id*="handle" i]',
    );
    await handleInput.first().fill("testuser123");

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await emailInput.first().fill("test@example.com");

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    await passwordInput.first().fill("securepassword123");

    // Submit the form
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create")',
    );
    await submitButton.first().click();

    // Wait for the network request
    await page.waitForTimeout(2000);

    // Verify the request was sent
    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/auth/register");
    expect(capturedRequest!.url).not.toContain("/v1/claims");

    // Verify request body
    const body = JSON.parse(capturedRequest!.body);
    expect(body).toHaveProperty("handle", "testuser123");
    expect(body).toHaveProperty("email", "test@example.com");
    expect(body).toHaveProperty("password", "securepassword123");
    // Must NOT contain "name" — that was the old schema
    expect(body).not.toHaveProperty("name");
  });
});

test.describe("Login flow", () => {
  // Scenario: User visits /auth/login and sees email + password fields
  test("login page has email and password fields", async ({ page }) => {
    await page.goto("/auth/login");

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput.first()).toBeVisible();

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    await expect(passwordInput.first()).toBeVisible();
  });

  // Scenario: Login form POSTs to /v1/auth/login with email and password
  test("login POST sends email, password to /v1/auth/login", async ({
    page,
  }) => {
    let capturedRequest: { url: string; body: string } | null = null;

    page.on("request", (request) => {
      if (request.url().includes("/auth/login") && request.method() === "POST") {
        capturedRequest = {
          url: request.url(),
          body: request.postData() || "",
        };
      }
    });

    await page.goto("/auth/login");

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await emailInput.first().fill("test@example.com");

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    await passwordInput.first().fill("securepassword123");

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Log in"), button:has-text("Login"), button:has-text("Sign in")',
    );
    await submitButton.first().click();

    await page.waitForTimeout(2000);

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/auth/login");

    const body = JSON.parse(capturedRequest!.body);
    expect(body).toHaveProperty("email", "test@example.com");
    expect(body).toHaveProperty("password", "securepassword123");
  });
});
