// phiacta-web-repo/tests/setup.ts
// Global test setup for Vitest
// Provides jsdom environment and any shared mocks

import { vi } from "vitest";

// Polyfill localStorage for test environment (Node.js v25 compatibility)
if (typeof globalThis.localStorage === "undefined" || typeof globalThis.localStorage.setItem !== "function") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}

// Reset mocks between tests
beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});
