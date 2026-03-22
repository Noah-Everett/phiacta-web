"use client";

import { Plus, Minus } from "lucide-react";

export default function DiffBlock({ patch, path }: { patch: string; path: string }) {
  const lines = patch.split("\n");
  return (
    <div className="rounded-lg border border-border overflow-hidden text-xs font-mono">
      <div className="bg-muted px-3 py-1.5 text-muted-foreground font-semibold border-b border-border">
        {path}
      </div>
      <div className="overflow-x-auto">
        {lines.map((line, i) => {
          let bg = "";
          let textColor = "text-foreground";
          let icon = null;
          if (line.startsWith("+") && !line.startsWith("+++")) {
            bg = "bg-green-50 dark:bg-green-950/30";
            textColor = "text-green-700 dark:text-green-300";
            icon = <Plus className="h-3 w-3 shrink-0 text-green-500" />;
          } else if (line.startsWith("-") && !line.startsWith("---")) {
            bg = "bg-red-50 dark:bg-red-950/30";
            textColor = "text-red-700 dark:text-red-300";
            icon = <Minus className="h-3 w-3 shrink-0 text-red-500" />;
          } else if (line.startsWith("@@")) {
            bg = "bg-blue-50 dark:bg-blue-950/30";
            textColor = "text-blue-600 dark:text-blue-400";
          }
          return (
            <div key={i} className={`flex items-start gap-1 px-3 py-0 leading-5 ${bg}`}>
              <span className="w-4 shrink-0 flex items-center justify-center">{icon}</span>
              <span className={`whitespace-pre ${textColor}`}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
