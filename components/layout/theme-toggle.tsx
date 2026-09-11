"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "preferred_theme";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    const nextIsLight = savedTheme === "light";
    document.documentElement.classList.toggle("light", nextIsLight);
    const frame = window.requestAnimationFrame(() => setIsLight(nextIsLight));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggleTheme() {
    const nextIsLight = !isLight;
    setIsLight(nextIsLight);
    window.localStorage.setItem(THEME_KEY, nextIsLight ? "light" : "dark");
    document.documentElement.classList.toggle("light", nextIsLight);
  }

  return (
    <button
      type="button"
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Switch to dark theme" : "Switch to light theme"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800/60 hover:text-white"
    >
      {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}