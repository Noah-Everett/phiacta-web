"use client";

import { useMemo } from "react";
import { createTwoFilesPatch } from "diff";
import DiffBlock from "./DiffBlock";

interface ContentDiffProps {
  original: string;
  modified: string;
  path: string;
}

export default function ContentDiff({ original, modified, path }: ContentDiffProps) {
  const patch = useMemo(() => {
    const diff = createTwoFilesPatch(path, path, original, modified, "", "", {
      context: 3,
    });
    // Strip the first two header lines (diff --git ... and index ...)
    // to match what DiffBlock expects (starts with --- a/path)
    const lines = diff.split("\n");
    const startIdx = lines.findIndex((l) => l.startsWith("---"));
    return startIdx >= 0 ? lines.slice(startIdx).join("\n") : diff;
  }, [original, modified, path]);

  if (original === modified) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No changes.</p>
    );
  }

  return <DiffBlock patch={patch} path={path} />;
}
