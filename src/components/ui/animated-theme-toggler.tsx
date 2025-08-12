"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedThemeTogglerProps {
  className?: string;
}

// Dark-only mode: keep helpers for future re-enable but unused for now

function setRootTheme(next: "light" | "dark") {
  const root = document.documentElement;
  root.setAttribute("data-theme", next);
  root.classList.toggle("dark", next === "dark");
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

export function AnimatedThemeToggler({ className }: AnimatedThemeTogglerProps) {

  useEffect(() => {
    // Force dark on mount
    setRootTheme("dark");
  }, []);

  const isDark = true;

  function handleToggle() {
    // Disabled while site is dark-only
    return;
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      onClick={handleToggle}
      className={[
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md",
        "ring-zinc-400 transition-all hover:ring-2",
        className ?? "",
      ].join(" ")}
    >
      {/* Sun */}
      <AnimatePresence initial={false}>
        {!isDark && (
          <motion.svg
            key="sun"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute h-6 w-6"
            initial={{ scale: 0.6, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, rotate: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </motion.svg>
        )}
      </AnimatePresence>
      {/* Moon */}
      <AnimatePresence initial={false}>
        {isDark && (
          <motion.svg
            key="moon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute h-6 w-6"
            initial={{ scale: 0.6, rotate: 90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, rotate: -90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <path d="M12 3c.13 0 .26 0 .39 0a7.5 7.5 0 0 0 7.92 12.45A9 9 0 1 1 12 3Z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}

export default AnimatedThemeToggler;


