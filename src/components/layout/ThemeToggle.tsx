"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-full text-charcoal-400 border border-transparent opacity-50 cursor-default">
        <Sun className="w-5 h-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2 rounded-full text-charcoal-400 hover:text-amber-500 hover:bg-charcoal-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      aria-label="Toggle theme"
    >
      {/* Sun icon for dark mode (click to go light) */}
      <Sun 
        className={`w-5 h-5 transition-all duration-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        }`} 
      />
      
      {/* Moon icon for light mode (click to go dark) */}
      <Moon 
        className={`w-5 h-5 transition-all duration-300 ${
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`} 
      />
    </button>
  );
}
