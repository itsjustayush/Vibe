import React from "react";
import { motion } from "motion/react";
import AyuVibeeLogo from "./AyuVibeeLogo";

interface AccessDeniedViewProps {
  attemptedEmail?: string;
  onReturn: () => void;
}

export default function AccessDeniedView({ attemptedEmail, onReturn }: AccessDeniedViewProps) {
  return (
    <div className="state-screen fixed inset-0 z-50 bg-[var(--background)] text-[var(--foreground)] overflow-y-auto flex flex-col justify-between">

      <header className="state-header px-4 sm:px-6 lg:px-10 py-5 flex justify-between items-center border-b border-[var(--border)]">
        <div className="flex items-center space-x-3 text-[#8b8780]">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-none animate-pulse"></span>
          <span className="font-mono text-[9px] tracking-widest uppercase">GATE_STATUS: ACCESS DENIED</span>
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
            <div className="h-px flex-1 bg-red-300/50" />
            <span className="font-mono text-[9px] tracking-[0.4em] text-red-400 uppercase">401</span>
            <div className="h-px flex-1 bg-red-300/50" />
          </div>

          {/* Big heading */}
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-black mb-2">
            Access Denied.
          </h1>
          <p className="font-mono text-[9px] tracking-widest text-[#8b8780] uppercase mb-8">
            This portal is restricted to the site curator only.
          </p>

          {/* Eye SVG */}
          <div className="relative w-48 h-28 mx-auto my-6 flex items-center justify-center">
            <svg viewBox="0 0 100 50" fill="none" className="w-full h-full">
              <path d="M 5,25 Q 50,2 95,25 Q 50,48 5,25 Z" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-red-400/30" />
              <path d="M 12,25 Q 50,7 88,25 Q 50,43 12,25 Z" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 3" fill="none" className="text-red-400/20" />
              <circle cx="50" cy="25" r="7" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-red-400/50" />
              <line x1="44" y1="19" x2="56" y2="31" stroke="currentColor" strokeWidth="0.5" className="text-red-400/60" />
              <line x1="56" y1="19" x2="44" y2="31" stroke="currentColor" strokeWidth="0.5" className="text-red-400/60" />
            </svg>
          </div>

          {/* Attempted email */}
          {attemptedEmail && (
            <div className="w-full p-3 border border-red-200 bg-red-50/60 mb-6">
              <p className="font-mono text-[8px] tracking-wider text-red-500 uppercase">Attempted identity</p>
              <p className="font-mono text-[10px] text-red-700 mt-1 break-all">{attemptedEmail}</p>
              <p className="font-mono text-[8px] tracking-wider text-red-400 uppercase mt-1">is not authorised for this portal.</p>
            </div>
          )}

          {/* Return button */}
          <button
            onClick={onReturn}
            className="button-primary w-full"
          >
            ← RETURN TO PORTFOLIO
          </button>

          <p className="font-mono text-[8px] text-[#8b8780] mt-5 uppercase tracking-wider leading-relaxed">
            If you believe this is an error, contact the site owner directly.
          </p>
        </motion.div>
      </main>

      <footer className="state-footer px-4 sm:px-6 lg:px-10 py-5 border-t border-[var(--border)] flex justify-between items-center text-[var(--muted-foreground)]">
        <div className="flex items-center gap-1.5">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          <span className="font-mono text-[8px] uppercase tracking-widest">Unauthorised Access Blocked</span>
        </div>
        <div className="font-mono text-[8px] uppercase tracking-widest">
          AYU.VIBEE © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
