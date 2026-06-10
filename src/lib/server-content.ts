import { API_URL } from "./api";

/**
 * An entry's primary content file and the format it was stored in.
 * `format` is the bare extension ("md" | "tex" | "txt"), matching the
 * `content_format`-derived value the renderers switch on.
 */
export interface PrimaryContent {
  content: string;
  format: "md" | "tex" | "txt";
}

// Probed in precedence order: a markdown entry's `.phiacta/content.md`
// wins over a LaTeX `.tex` over a plain `.txt`.
const CONTENT_EXTS = ["md", "tex", "txt"] as const;

/**
 * Fetch an entry's primary content file, server-side, for SSR.
 *
 * Mirrors the client probe in the entry page but is auth-less on purpose:
 * the server has no user token, so it only ever sees the public view. For a
 * public entry the file API returns the body (200); for a private one it
 * returns 403 and we yield null, so private content never reaches the
 * server-rendered HTML. The client provider re-fetches with the viewer's
 * token after hydration to cover the authorized-private case.
 *
 * Never throws — a missing file or an unreachable backend yields null, and
 * the page falls back to client fetching exactly as before.
 */
export async function fetchPrimaryContent(
  entryId: string,
): Promise<PrimaryContent | null> {
  for (const ext of CONTENT_EXTS) {
    try {
      const res = await fetch(
        `${API_URL}/v1/entries/${entryId}/files/.phiacta/content.${ext}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const text = await res.text();
        if (text) return { content: text, format: ext };
      }
    } catch {
      // Network/backend error — treat as "no content" and let the client
      // try again after hydration.
    }
  }
  return null;
}
