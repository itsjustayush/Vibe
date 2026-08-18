import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface RotatingTextProps {
  texts: string[];
  rotationInterval?: number;
  className?: string;
}

export default function RotatingText({ texts, rotationInterval = 2600, className = "" }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (texts.length < 2) return;
    const interval = window.setInterval(() => setIndex((current) => (current + 1) % texts.length), rotationInterval);
    return () => window.clearInterval(interval);
  }, [rotationInterval, texts.length]);

  const current = texts[index] ?? texts[0] ?? "";

  return (
    <span className={`relative inline-flex min-w-0 overflow-hidden ${className}`} aria-live="polite">
      <span className="sr-only">{current}</span>
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={current}
          aria-hidden="true"
          className="inline-block"
          initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
