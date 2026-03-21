import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mb-2 text-xl font-semibold text-foreground">Page not found</h1>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/explore">Browse entries</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
