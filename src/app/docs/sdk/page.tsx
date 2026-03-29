"use client";

import { Badge } from "@/components/ui/badge";
import { Code2, FileText, Puzzle, Terminal } from "lucide-react";

export default function DocsSdkPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <section className="mb-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Terminal className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Python SDK</h2>
            <p className="text-sm text-muted-foreground">Typed async client for the Phiacta API</p>
          </div>
        </div>
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
          The Python SDK provides typed access to every API endpoint. Async-first with Pydantic
          models. Authenticate with a personal access token.
        </p>

        {/* Install */}
        <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Install
          </p>
          <pre className="overflow-x-auto text-sm text-foreground"><code>pip install git+https://github.com/Noah-Everett/phiacta-sdk-python.git</code></pre>
        </div>

        {/* Example: Create entry */}
        <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Create an entry
          </p>
          <pre className="overflow-x-auto text-sm leading-relaxed text-foreground"><code>{`import asyncio
from phiacta_sdk import PhiactaClient

async def main():
    async with PhiactaClient(
        base_url="https://api.phiacta.com",
        token="<your-token>",
    ) as client:
        entry = await client.create_entry({
            "title": "Euler's identity",
            "entry_type": "theorem",
            "summary": "e^(iπ) + 1 = 0",
            "content": "Euler's identity states that...",
            "tags": ["mathematics", "complex-analysis"],
        })
        print(f"Created: {entry.id}")

asyncio.run(main())`}</code></pre>
        </div>

        {/* Example: Search */}
        <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Search entries
          </p>
          <pre className="overflow-x-auto text-sm leading-relaxed text-foreground"><code>{`search = client.tool("search")
results = await search.get("/", params={"q": "quantum"})

for item in results["items"]:
    print(f"{item['title']} (rank: {item['rank']:.2f})")`}</code></pre>
        </div>

        {/* Example: References */}
        <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Add a reference
          </p>
          <pre className="overflow-x-auto text-sm leading-relaxed text-foreground"><code>{`refs = client.extension("references")
await refs.post(
    f"/{entry_id}",
    json={
        "target_entry_id": "<target-id>",
        "rel": "cites",
        "note": "Key prior work",
    },
    auth=True,
)`}</code></pre>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
            <Code2 className="h-3 w-3" /> Async/await
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
            <FileText className="h-3 w-3" /> Pydantic models
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
            <Puzzle className="h-3 w-3" /> Plugin namespace helpers
          </Badge>
        </div>
      </section>
    </div>
  );
}
