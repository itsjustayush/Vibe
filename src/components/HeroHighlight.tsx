import { motion } from "motion/react";
import type { ReactNode } from "react";

export function HeroHighlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`hero-highlight ${className}`}>
      <div className="hero-highlight-grid" aria-hidden="true" />
      <div className="hero-highlight-glow" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function Highlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.span
      initial={{ backgroundSize: "0% 100%" }}
      animate={{ backgroundSize: "100% 100%" }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`hero-highlight-mark ${className}`}
    >
      {children}
    </motion.span>
  );
}
