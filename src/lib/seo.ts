/**
 * Shared SEO constants.
 *
 * `SITE_URL` is the canonical origin of the deployed frontend and is used
 * in the sitemap, robots.txt, canonical links, and Open Graph tags.
 * It falls back to the production domain so that dev builds still emit
 * useful absolute URLs when the env var is missing.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://phiacta.com";

export const SITE_NAME = "Phiacta";

export const DEFAULT_DESCRIPTION =
  "A permanent home for knowledge — versioned, citable entries backed by git.";

/**
 * Default image used for Open Graph / Twitter previews when a page doesn't
 * supply its own. SVG is not universally accepted by social platforms; when
 * we add a dedicated OG image generator this constant should point at the
 * generated 1200×630 PNG.
 */
export const DEFAULT_OG_IMAGE = "/logo-full.svg";
