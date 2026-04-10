"use client";

import { useState } from "react";

const TABS = [
  {
    id: "api",
    label: "REST API",
    lang: "curl",
    description:
      "Full OpenAPI spec. Every operation the website uses is a documented endpoint — create entries, manage references, search, and traverse the knowledge graph.",
    code: `# Search entries
curl https://api.phiacta.com/v1/tools/search \\
  -H "Authorization: Bearer pat_..." \\
  -G --data-urlencode "q=log-uniform quantization"

# Traverse the reference graph from an entry
curl https://api.phiacta.com/v1/tools/graph \\
  -H "Authorization: Bearer pat_..." \\
  -G -d "seed=<entry-id>&depth=2"

# Create an entry
curl -X POST https://api.phiacta.com/v1/entries \\
  -H "Authorization: Bearer pat_..." \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My Theorem","entry_type":"theorem"}'`,
  },
  {
    id: "sdk",
    label: "Python SDK",
    lang: "python",
    description:
      "Async client with typed models. Automate ingestion pipelines, build analysis tools, or integrate Phiacta into existing research workflows in a few lines.",
    code: `from phiacta import PhiactaClient

client = PhiactaClient(token="pat_...")

# Full-text search across all entries
results = await client.tools.search("log-uniform quantization")

# Traverse the reference graph from any entry
graph = await client.tools.graph(seed=[entry_id], depth=2)

# Create an entry programmatically
entry = await client.entries.create(
    title="Gradient Descent Convergence on Convex Loss",
    entry_type="theorem",
    content_format="markdown",
)`,
  },
  {
    id: "mcp",
    label: "MCP Server",
    lang: "json",
    description:
      "Connect Claude, Cursor, Codex, or any MCP-compatible agent. Tool schemas and documentation are built in — your agent can search, read, and create entries immediately.",
    code: `{
  "mcpServers": {
    "phiacta": {
      "command": "uvx",
      "args": ["phiacta-mcp"],
      "env": {
        "PHIACTA_TOKEN": "pat_..."
      }
    }
  }
}`,
  },
];

export function BuildOnItTabs() {
  const [active, setActive] = useState("mcp");
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div>
      {/* Tab selectors */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`rounded-xl border p-5 text-left transition-colors ${
              active === t.id
                ? "border-primary/50 bg-primary/5 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-border/80 hover:text-foreground"
            }`}
          >
            <p className={`text-sm font-semibold ${active === t.id ? "text-foreground" : ""}`}>
              {t.label}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.lang}</p>
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
        {tab.description}
      </p>

      {/* Code block */}
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-zinc-950/90 px-5 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-zinc-500">{tab.lang}</span>
        </div>
        <pre className="overflow-x-auto bg-zinc-950 px-6 py-5 text-xs font-mono leading-relaxed text-zinc-300">
          <code>{tab.code}</code>
        </pre>
      </div>
    </div>
  );
}
