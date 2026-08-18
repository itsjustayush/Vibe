import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import avThemeMark from "../assets/images/av-theme-mark.png";

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle theme-toggle--mark group inline-flex min-h-11 items-center gap-2.5 border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)] ${compact ? "w-full justify-between px-4 py-3" : ""}`}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-pressed={isDark}
      title={`Switch to ${nextTheme} mode`}
    >
      <span className="inline-flex items-center gap-2.5">
        {isDark ? (
          <Sun aria-hidden="true" size={15} strokeWidth={1.7} />
        ) : (
          <span className="theme-toggle-mark inline-flex h-5 w-5 items-center justify-center overflow-hidden bg-black" aria-hidden="true">
            <img src={avThemeMark} alt="" className="h-full w-full object-cover" />
          </span>
        )}
        <span>{compact ? "Appearance" : isDark ? "Light" : "Dark"}</span>
      </span>
      {compact && <span className="inline-flex items-center gap-2 text-[9px] text-[var(--foreground)]">{isDark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
