import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

type ThemeToggleButtonProps = {
  className?: string;
};

const ThemeToggleButton = ({ className = "" }: ThemeToggleButtonProps) => {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const storedTheme = localStorage.getItem("portfolio-theme");
    if (!storedTheme) return;
    const dark = storedTheme === "dark";
    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("portfolio-theme", next ? "dark" : "light");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-lg border border-[var(--border-1)] bg-[var(--surface-2)] p-2 transition-colors duration-200 hover:bg-[var(--surface-3)] ${className}`}
      aria-label="Toggle theme"
      title="Toggle theme"
      type="button"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-[var(--accent-1)]" />
      ) : (
        <Moon className="h-5 w-5 theme-text-1" />
      )}
    </motion.button>
  );
};

export default ThemeToggleButton;
