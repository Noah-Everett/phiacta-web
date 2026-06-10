// Shared, side-effect-free fixtures for the SSR e2e suite. Imported by both
// the mock API server (which serves them) and the spec (which asserts on
// them). Keep this file free of any `listen`/IO so the spec can import it
// without spawning a second server.

export const PUBLIC_ID = "11111111-1111-1111-1111-111111111111";
export const PRIVATE_ID = "22222222-2222-2222-2222-222222222222";

export const PUBLIC_TITLE = "Public SSR Entry Title";
export const PUBLIC_BODY_MARKER = "ZETA-SSR-BODY-MARKER";

export const PRIVATE_TITLE = "Private SSR Entry Title";
export const PRIVATE_BODY_MARKER = "SECRET-PRIVATE-BODY-MARKER";

export const PUBLIC_CONTENT_MD = `## Server Rendered Section\n\nThis paragraph contains the ${PUBLIC_BODY_MARKER} so the test can find it.\n`;
export const PRIVATE_CONTENT_MD = `# Secret\n\n${PRIVATE_BODY_MARKER}\n`;
