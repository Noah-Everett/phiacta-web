// Minimal dependency-free mock of the Phiacta backend, used only by the
// SSR Playwright config (playwright.ssr.config.ts).
//
// Why this exists: SSR data fetching happens on the Next *server*, which
// page.route() in the browser cannot intercept. To assert what lands in the
// initial HTML we must point the Next server at a real HTTP backend whose
// responses we control. This server provides exactly two fixtures:
//
//   PUBLIC  — readable unauthenticated, with a content.md body. Its title
//             and body MUST appear in the SSR HTML.
//   PRIVATE — returns metadata 200 even unauthenticated (the *riskier* of
//             the two possible backend behaviours) and 403 on its content.
//             Its title and body MUST NOT appear in the SSR HTML — proving
//             the layout's visibility gate, not the backend, is what keeps
//             private data out of the HTML.

import { createServer } from "node:http";
import {
  PUBLIC_ID,
  PRIVATE_ID,
  PUBLIC_TITLE,
  PRIVATE_TITLE,
  PUBLIC_CONTENT_MD,
} from "./fixtures.mjs";

const PORT = Number(process.env.MOCK_API_PORT || 8788);

const USER = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  username: "ssr_author",
  created_at: "2026-01-01T00:00:00Z",
};

function entry(id, title, visibility) {
  return {
    id,
    forgejo_repo_id: 1,
    repo_name: id,
    current_head_sha: "abcdef0123456789abcdef0123456789abcdef01",
    repo_status: "ready",
    visibility,
    created_by: USER.id,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-02T00:00:00Z",
    title,
    summary: `${title} summary`,
    entry_type: "paper",
    tags: [],
    references: [],
    compiled_content: null,
  };
}

function json(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}
function text(res, status, body, contentType = "text/markdown") {
  res.writeHead(status, { "Content-Type": contentType });
  res.end(body);
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);

  // Content files
  if (pathname === `/v1/entries/${PUBLIC_ID}/files/.phiacta/content.md`) {
    return text(res, 200, PUBLIC_CONTENT_MD);
  }
  if (
    pathname === `/v1/entries/${PUBLIC_ID}/files/.phiacta/content.tex` ||
    pathname === `/v1/entries/${PUBLIC_ID}/files/.phiacta/content.txt`
  ) {
    return json(res, 404, { detail: "Not found" });
  }
  if (pathname.startsWith(`/v1/entries/${PRIVATE_ID}/files/`)) {
    return json(res, 403, { detail: "Forbidden" });
  }

  // Entry metadata
  if (pathname === `/v1/entries/${PUBLIC_ID}`) {
    return json(res, 200, entry(PUBLIC_ID, PUBLIC_TITLE, "public"));
  }
  if (pathname === `/v1/entries/${PRIVATE_ID}`) {
    // Deliberately permissive: hand back private metadata unauthenticated.
    return json(res, 200, entry(PRIVATE_ID, PRIVATE_TITLE, "private"));
  }

  // Author lookup (used by the client provider after hydration).
  if (pathname.startsWith("/v1/users/")) {
    return json(res, 200, USER);
  }

  return json(res, 404, { detail: `mock: no route for ${pathname}` });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[mock-api] listening on http://localhost:${PORT}`);
});
