"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { Sun, Moon, Monitor } from "lucide-react";

const THEMES = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Customize how Phiacta looks
      </p>

      <Separator className="my-5" />

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Theme</p>
        <div className="flex gap-2">
          {THEMES.map(({ value, label, icon: Icon }) => {
            const active = mounted && theme === value;
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "border-foreground bg-secondary font-medium text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
