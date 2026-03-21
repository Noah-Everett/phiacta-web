"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import NavbarAuth from "./NavbarAuth";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/extensions", label: "Extensions" },
  { href: "/contribute", label: "Contribute" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo-navbar.svg"
            alt="Phiacta"
            width={145}
            height={64}
            className="h-8 w-auto dark:invert"
          />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === href || pathname?.startsWith(href + "/")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto hidden w-72 sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              className="h-8 pl-8 text-sm"
              onFocus={() => {
                if (typeof window !== "undefined") {
                  window.location.href = "/explore";
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavbarAuth />
        </div>
      </div>
    </nav>
  );
}
