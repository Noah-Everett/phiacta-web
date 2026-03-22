import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/contribute", label: "Contribute" },
  { href: "/about", label: "About" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">Phiacta</p>
            <p className="text-xs text-muted-foreground">The knowledge backend.</p>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            {LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
