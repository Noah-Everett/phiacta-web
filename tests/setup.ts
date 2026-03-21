// phiacta-web-repo/tests/setup.ts
// Global test setup for Vitest
// Provides jsdom environment and any shared mocks

// Stub fetch globally so API client tests can intercept requests
// without hitting real network
import { vi } from "vitest";

// Reset mocks between tests
beforeEach(() => {
  vi.restoreAllMocks();
});
