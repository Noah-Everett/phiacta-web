"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "./ThemeToggle";
import NavbarAuth from "./NavbarAuth";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/contribute", label: "Contribute" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo-navbar.svg"
            alt="Phiacta"
            width={145}
            height={64}
            className="h-8 w-auto dark:invert"
          />
        </Link>

        {/* Nav links */}
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

        {/* Search */}
        <div className="ml-auto hidden w-72 sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search claims…"
              className="h-8 pl-8 text-sm"
              onFocus={(e) => {
                if (typeof window !== "undefined") {
                  window.location.href = "/search?q=" + encodeURIComponent(e.target.value);
                }
              }}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavbarAuth />
        </div>
      </div>
    </nav>
  );
}
