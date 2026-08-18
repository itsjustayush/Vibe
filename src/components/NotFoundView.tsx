import React from "react";
import { motion } from "motion/react";
import AyuVibeeLogo from "./AyuVibeeLogo";

interface NotFoundViewProps {
  onReturn: () => void;
}

export default function NotFoundView({ onReturn }: NotFoundViewProps) {
  return (
    <div className="state-screen fixed inset-0 z-50 bg-[var(--background)] text-[var(--foreground)] overflow-y-auto flex flex-col justify-between">

      <header className="state-header px-4 sm:px-6 lg:px-10 py-5 flex justify-between items-center border-b border-[var(--border)]">
        <div className="flex items-center space-x-3 text-[#8b8780]">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-none animate-pulse"></span>
          <span className="font-mono text-[9px] tracking-widest uppercase">SYSTEM: PAGE NOT FOUND</span>
        </div>
        <button
          onClick={onReturn}
          className="font-mono text-[9px] tracking-widest text-[#8b5e20] uppercase hover:text-black transition-colors cursor-pointer"
        >
          CLOSE ×
        </button>
      </header>

      <main className="state-card max-w-sm w-full mx-auto px-6 py-10 flex flex-col items-center text-center">

        <div className="mb-8">
          <AyuVibeeLogo size="lg" theme="dark" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {/* Code block */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 bg-amber-300/50" />
            <span className="font-mono text-[9px] tracking-[0.4em] text-amber-500 uppercase">404</span>
            <div className="h-px flex-1 bg-amber-300/50" />
          </div>

          {/* Big heading */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-black mb-2">
            Not Found.
          </h1>
          <p className="font-mono text-[9px] tracking-widest text-[#8b8780] uppercase mb-8">
            The page you are looking for does not exist.
          </p>

          {/* Decorative lens / aperture SVG */}
          <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.5" className="text-black/10" />
              <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="0.3" strokeDasharray="3 4" className="text-black/10" />
              <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="0.4" className="text-black/15" />
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 50 + 18 * Math.cos(rad);
                const y1 = 50 + 18 * Math.sin(rad);
                const x2 = 50 + 38 * Math.cos(rad);
                const y2 = 50 + 38 * Math.sin(rad);
                return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.3" className="text-black/10" />;
              })}
              <text x="50" y="55" textAnchor="middle" fontFamily="monospace" fontSize="14" fill="currentColor" className="text-black/20">404</text>
            </svg>
          </div>

          {/* Navigation options */}
          <div className="space-y-3 mb-6">
            <button
              onClick={onReturn}
              className="button-primary w-full"
            >
              ← RETURN TO PORTFOLIO
            </button>
          </div>

          <p className="font-mono text-[8px] text-[#8b8780] uppercase tracking-wider leading-relaxed">
            The frame you sought was never captured — or has since been archived.
          </p>
        </motion.div>
      </main>

      <footer className="state-footer px-4 sm:px-6 lg:px-10 py-5 border-t border-[var(--border)] flex justify-between items-center text-[var(--muted-foreground)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
          <span className="font-mono text-[8px] uppercase tracking-widest">Route Not Resolved</span>
        </div>
        <div className="font-mono text-[8px] uppercase tracking-widest">
          AYU.VIBEE © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
