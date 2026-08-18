import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  stepDuration?: number;
  onAnimationComplete?: () => void;
}

export default function BlurText({
  text,
  delay = 110,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  stepDuration = 0.42,
  onAnimationComplete,
}: BlurTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const elements = useMemo(() => (animateBy === "words" ? text.split(" ") : Array.from(text)), [animateBy, text]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  const startY = direction === "top" ? -26 : 26;
  const totalDuration = Math.max(0.28, stepDuration);

  return (
    <span ref={ref} className={className} aria-label={text} style={{ display: "flex", flexWrap: "wrap" } as CSSProperties}>
      {elements.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          className="inline-block will-change-[transform,filter,opacity]"
          initial={{ filter: "blur(10px)", opacity: 0, y: startY }}
          animate={inView ? { filter: "blur(0px)", opacity: 1, y: 0 } : { filter: "blur(10px)", opacity: 0, y: startY }}
          transition={{ duration: totalDuration, delay: (index * delay) / 1000, ease: [0.23, 1, 0.32, 1] }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
        >
          {segment}
          {animateBy === "words" && index < elements.length - 1 ? "\u00A0" : null}
        </motion.span>
      ))}
    </span>
  );
}
