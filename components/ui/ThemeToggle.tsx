"use client";

import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  };

  if (!mounted) {
    return (
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-theme-border bg-theme-surface text-theme-text shadow-sm transition-colors hover:bg-theme-surface-hover"
        aria-label="Toggle Theme"
      />
    );
  }

  const getIcon = () => {
    if (theme === "light") return <Sun size={17} />;
    return <Moon size={17} />;
  };

  return (
    <button onClick={toggleTheme} title="Toggle Theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-theme-border bg-theme-surface text-theme-text shadow-sm transition-colors hover:bg-theme-surface-hover"    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {getIcon()}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
