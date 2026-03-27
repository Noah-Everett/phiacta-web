"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { EntryTypeBadge } from "@/components/EntryBadges";
import type { EntryListItem } from "@/lib/types";

export function EntryCarousel({ entries }: { entries: EntryListItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const posRef = useRef(0);

  const onEnter = useCallback(() => { pausedRef.current = true; }, []);
  const onLeave = useCallback(() => { pausedRef.current = false; }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf: number;
    const pxPerSecond = 30;
    let last = performance.now();

    function step(now: number) {
      const dt = now - last;
      last = now;

      if (!pausedRef.current && el) {
        posRef.current += (pxPerSecond * dt) / 1000;
        const half = el.scrollWidth / 2;
        if (posRef.current >= half) {
          posRef.current -= half;
        }
        el.scrollLeft = posRef.current;
      }

      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Duplicate entries for seamless loop
  const items = [...entries, ...entries];

  return (
    <div
      ref={scrollRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex gap-4 overflow-x-auto px-6 pb-6"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {items.map((entry, i) => (
        <Link
          key={`${entry.id}-${i}`}
          href={`/entries/${entry.id}`}
          style={{ width: 300, minWidth: 300, maxWidth: 300 }}
          className="group flex shrink-0 flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex flex-wrap items-start gap-2">
            <EntryTypeBadge entryType={entry.entry_type} />
          </div>
          <p className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground transition-colors group-hover:text-primary">
            {entry.title || "Untitled"}
          </p>
          {entry.summary && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {entry.summary}
            </p>
          )}
          <p className="mt-auto text-xs text-muted-foreground">
            {new Date(entry.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </Link>
      ))}
    </div>
  );
}
