import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Search is coming soon</h1>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Full-text and semantic search across all entries is being built.
        In the meantime, you can browse and filter entries on the Explore page.
      </p>
      <Button asChild>
        <Link href="/explore">Browse entries</Link>
      </Button>
    </div>
  );
}
