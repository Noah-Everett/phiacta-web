import type { ThemedToken, HighlighterGeneric, BundledLanguage, BundledTheme } from "shiki";

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: [],
      })
    );
  }
  return highlighterPromise;
}

const EXT_TO_LANG: Record<string, string> = {
  ".py": "python",
  ".js": "javascript",
  ".ts": "typescript",
  ".tsx": "tsx",
  ".jsx": "jsx",
  ".json": "json",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".toml": "toml",
  ".html": "html",
  ".css": "css",
  ".sh": "bash",
  ".bash": "bash",
  ".zsh": "bash",
  ".rs": "rust",
  ".go": "go",
  ".java": "java",
  ".c": "c",
  ".h": "c",
  ".cpp": "cpp",
  ".hpp": "cpp",
  ".rb": "ruby",
  ".r": "r",
  ".sql": "sql",
  ".xml": "xml",
  ".tex": "latex",
  ".md": "markdown",
  ".lean": "lean4",
  ".dockerfile": "dockerfile",
  ".ini": "ini",
  ".cfg": "ini",
  ".env": "shellscript",
  ".csv": "csv",
  ".gitignore": "gitignore",
};

const NAME_TO_LANG: Record<string, string> = {
  dockerfile: "dockerfile",
  makefile: "makefile",
  ".gitignore": "gitignore",
};

export function getLanguageFromPath(path: string): string | null {
  const name = path.split("/").pop()?.toLowerCase() || "";
  if (NAME_TO_LANG[name]) return NAME_TO_LANG[name];

  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return null;
  const ext = name.substring(dotIndex).toLowerCase();
  return EXT_TO_LANG[ext] ?? null;
}

export interface HighlightToken {
  content: string;
  color?: string;
}

export async function highlightCode(
  code: string,
  lang: string,
  theme: "github-light" | "github-dark",
): Promise<HighlightToken[][] | null> {
  try {
    const highlighter = await getHighlighter();

    const loadedLangs = highlighter.getLoadedLanguages();
    if (!loadedLangs.includes(lang as BundledLanguage)) {
      await highlighter.loadLanguage(lang as BundledLanguage);
    }

    const result = highlighter.codeToTokens(code, { lang: lang as BundledLanguage, theme });
    return result.tokens.map((line: ThemedToken[]) =>
      line.map((token: ThemedToken) => ({
        content: token.content,
        color: token.color,
      })),
    );
  } catch {
    return null;
  }
}
