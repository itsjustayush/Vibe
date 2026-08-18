import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import AyuVibeeLogo from "./AyuVibeeLogo";

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenGate: () => void;
  isAdmin: boolean;
  onLogout?: () => void;
}

export default function Navigation({ currentView, onNavigate, onOpenGate, isAdmin, onLogout }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const navLinks = [
    { id: "portfolio", label: "Portfolio" },
    { id: "stories", label: "Stories" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 w-full border-b border-[#e5e1d8] bg-[#f7f4ed]/90 backdrop-blur-md px-6 md:px-16 lg:px-20 py-4 flex items-center justify-between" role="navigation" aria-label="Main navigation">

        {/* Brand */}
        <button
          onClick={() => handleNav("portfolio")}
          className="cursor-pointer hover:opacity-80 transition-opacity py-1 z-50 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded"
          aria-label="AYU.VIBEE Home"
        >
          <AyuVibeeLogo size="sm" theme={isDark ? "light" : "dark"} className="!items-start" />
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`font-sans text-xs tracking-[0.2em] uppercase cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-black rounded px-1 py-1 ${
                currentView === link.id
                  ? "font-bold text-black border-b border-black pb-0.5"
                  : "text-[#5f5e59] hover:text-black"
              }`}
              aria-current={currentView === link.id ? "page" : undefined}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle inline-flex min-h-11 items-center gap-2 border border-[#e5e1d8] px-3 py-2 font-mono text-[10px] tracking-widest uppercase text-[#5f5e59] transition-colors hover:border-black hover:text-black"
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            aria-pressed={isDark}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Sun aria-hidden="true" size={15} strokeWidth={1.7} /> : <Moon aria-hidden="true" size={15} strokeWidth={1.7} />}
            <span>{isDark ? "Light" : "Dark"}</span>
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => handleNav("admin")}
                className="px-4 py-2 bg-black text-[#f7f4ed] font-sans text-xs tracking-widest uppercase hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded"
              >
                Dashboard
              </button>
              <button
                onClick={onLogout}
                className="px-3 py-2 border border-black font-sans text-xs tracking-widest uppercase hover:bg-black hover:text-[#f7f4ed] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded"
                aria-label="Logout"
              >
                <span className="material-symbols-outlined text-[16px] block">logout</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden z-50 relative p-1.5 cursor-pointer text-[#1a1a1a]"
          onClick={() => setMobileOpen(prev => !prev)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[22px]">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </nav>

      {/* ── Mobile Drawer ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-[#f7f4ed] flex flex-col pt-20 px-8 pb-10 md:hidden overflow-y-auto">
          <nav className="flex flex-col gap-2 mt-4">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`text-left py-4 border-b border-[#e5e1d8] font-sans text-lg tracking-[0.1em] uppercase cursor-pointer transition-colors ${
                  currentView === link.id ? "text-black font-bold" : "text-[#5f5e59]"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="theme-toggle flex min-h-12 w-full items-center justify-between border border-[#e5e1d8] px-4 py-3 font-mono text-[11px] tracking-widest uppercase text-[#5f5e59] transition-colors hover:border-black hover:text-black"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
              aria-pressed={isDark}
            >
              <span>Appearance</span>
              <span className="inline-flex items-center gap-2">
                {isDark ? <Sun aria-hidden="true" size={16} strokeWidth={1.7} /> : <Moon aria-hidden="true" size={16} strokeWidth={1.7} />}
                <span>{isDark ? "Light mode" : "Dark mode"}</span>
              </span>
            </button>
            {isAdmin ? (
              <>
                <button
                  onClick={() => handleNav("admin")}
                  className="w-full py-4 bg-black text-white font-mono text-[11px] tracking-widest uppercase cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Admin Dashboard
                </button>
                <button
                  onClick={() => { setMobileOpen(false); onLogout?.(); }}
                  className="w-full py-3.5 border border-black font-mono text-[11px] tracking-widest uppercase cursor-pointer hover:bg-black hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNav("contact")}
                className="w-full py-4 bg-black text-white font-mono text-[11px] tracking-widest uppercase cursor-pointer hover:opacity-90 transition-opacity"
              >
                Get in Touch
              </button>
            )}
          </div>

          {/* Social quick links in mobile drawer */}
          <div className="mt-auto pt-10 flex flex-wrap gap-4">
            {[
              { label: "Instagram", href: "https://instagram.com/ayu.vibee" },
              { label: "X / Twitter", href: "https://x.com/ayushbhattacharya" },
              { label: "Email", href: "mailto:ayush@ayu.vibee" },
            ].map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] uppercase tracking-widest text-[#8b8780] hover:text-black transition-colors border-b border-[#e5e1d8] pb-0.5"
              >
                {s.label}
              </a>
            ))}
          </div>
          <p className="font-mono text-[8px] text-[#8b8780] mt-4 uppercase tracking-widest">
            © 2026 AYU.VIBEE — Kolkata, India
          </p>
        </div>
      )}
    </>
  );
}

export function Footer({ onNavigate, onOpenGate }: { onNavigate: (view: string) => void; onOpenGate: () => void }) {
  const { theme } = useTheme();

  return (
    <footer className="w-full border-t border-[#e5e1d8] bg-[#f7f4ed] px-6 md:px-16 lg:px-20 py-10 mt-20" role="contentinfo">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

        {/* Brand */}
        <div className="flex flex-col gap-2">
          <AyuVibeeLogo size="sm" theme={theme === "dark" ? "light" : "dark"} />
          <p className="font-sans text-[9px] tracking-widest uppercase text-[#a09e99]">
            © {new Date().getFullYear()} AYU.VIBEE Photography & Editorial. All rights reserved.
          </p>
          <p className="font-mono text-[8px] uppercase tracking-wider text-[#c5c0b8]">
            Ayush· Kolkata, India
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Footer navigation">
          {[
            { label: "Portfolio", view: "portfolio" },
            { label: "Stories", view: "stories" },
            { label: "About", view: "about" },
            { label: "Contact", view: "contact" },
            { label: "Terms", view: "terms" },
          ].map(l => (
            <button
              key={l.view}
              onClick={() => onNavigate(l.view)}
              className="font-sans text-[11px] tracking-widest uppercase text-[#5f5e59] hover:text-black transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-black rounded px-1 py-1"
            >
              {l.label}
            </button>
          ))}
          {/* Hidden admin gate — subtle */}
          <button
            onClick={onOpenGate}
            className="font-mono text-[9px] tracking-widest uppercase text-[#c5c0b8] hover:text-[#8b8780] transition-colors cursor-pointer text-center border border-[#b0aba4] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black rounded"
            aria-label="Curator Gate - Admin login"
          >
            ⬡ Curator Gate [admins]
          </button>
        </nav>
      </div>
    </footer>
  );
}
