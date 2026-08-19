import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import AyuVibeeLogo from "./AyuVibeeLogo";
import ThemeToggle from "./ThemeToggle";
import ResizableNavbar from "./ResizableNavbar";
import LinkPreview from "./LinkPreview";

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenGate: () => void;
  isAdmin: boolean;
  onLogout?: () => void;
}

export default function Navigation({ currentView, onNavigate, onOpenGate, isAdmin, onLogout }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
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
    <ResizableNavbar>
      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur-xl px-4 sm:px-6 lg:px-10 py-3.5 flex items-center justify-between" role="navigation" aria-label="Main navigation">

        {/* Brand */}
        <button
          onClick={() => handleNav("portfolio")}
          className="group cursor-pointer py-1 z-50 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--ring)] rounded-md transition-transform duration-200 hover:-translate-y-0.5"
          aria-label="AYU.VIBEE Home"
        >
          <AyuVibeeLogo size="sm" theme={isDark ? "light" : "dark"} className="!items-start" />
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)]/75 p-1 shadow-[0_4px_24px_var(--shadow-ink)]">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNav(link.id)}
              className={`min-h-10 rounded-full px-4 py-2 font-sans text-[10px] font-semibold tracking-[0.18em] uppercase cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                currentView === link.id
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_3px_12px_var(--shadow-ink)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]"
              }`}
              aria-current={currentView === link.id ? "page" : undefined}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
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
          className="md:hidden z-50 relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground)] shadow-[0_3px_12px_var(--shadow-ink)]"
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
        <div className="fixed inset-0 z-30 bg-[var(--background)] text-[var(--foreground)] flex flex-col pt-20 px-6 pb-10 md:hidden overflow-y-auto">
          <nav className="flex flex-col gap-2 mt-4">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNav(link.id)}
                className={`min-h-14 text-left rounded-xl px-4 border border-transparent font-sans text-xl tracking-[0.04em] uppercase cursor-pointer transition-all ${
                  currentView === link.id ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:bg-[var(--surface-subtle)] hover:border-[var(--border)]"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 space-y-3">
            <ThemeToggle compact />
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
              <LinkPreview
                key={s.label}
                url={s.href}
                className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors border-b border-[var(--border)] pb-0.5"
              >
                {s.label}
              </LinkPreview>
            ))}
          </div>
          <p className="font-mono text-[8px] text-[#8b8780] mt-4 uppercase tracking-widest">
            © 2026 AYU.VIBEE — Kolkata, India
          </p>
        </div>
      )}
    </ResizableNavbar>
  );
}

export function Footer({ onNavigate, onOpenGate }: { onNavigate: (view: string) => void; onOpenGate: () => void }) {
  const { theme } = useTheme();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface-subtle)] px-4 sm:px-6 lg:px-10 py-14 mt-24" role="contentinfo">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-start">

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
        <nav className="flex max-w-lg flex-wrap justify-start md:justify-end gap-2" aria-label="Footer navigation">
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
