"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-6 w-36" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
      {/* Dynamic Text Label */}
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 min-w-19">
        {isDark ? "Dark mode" : "Light mode"}
      </span>

      {/* Hidden Checkbox */}
      <input
        type="checkbox"
        checked={isDark}
        onChange={() => setTheme(isDark ? "light" : "dark")}
        className="sr-only"
      />

      {/* The Visual Toggle Switch Track */}
      <div 
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 border
          ${isDark 
            ? "bg-zinc-800 border-zinc-700" 
            : "bg-zinc-200 border-zinc-300"
          }`}
      >
        {/* The Moving Switch Knob */}
        <div
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-200
            ${isDark ? "translate-x-5" : "translate-x-0"}`}
        />
      </div>
    </label>
  );
}
