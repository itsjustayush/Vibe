import { useEffect, useState } from "react";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
}

export default function TextGenerateEffect({ words, className = "", duration = 420 }: TextGenerateEffectProps) {
  const [visibleWords, setVisibleWords] = useState(0);
  const tokens = words.trim().split(/\s+/);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleWords(tokens.length);
      return;
    }

    let frame = 0;
    const interval = window.setInterval(() => {
      frame += 1;
      setVisibleWords(Math.min(tokens.length, frame));
      if (frame >= tokens.length) window.clearInterval(interval);
    }, Math.max(22, Math.floor(duration / Math.max(tokens.length, 1))));
    return () => window.clearInterval(interval);
  }, [duration, words, tokens.length]);

  return (
    <span className={`text-generate-effect ${className}`} aria-label={words}>
      {tokens.map((token, index) => (
        <span key={`${token}-${index}`} className={index < visibleWords ? "is-visible" : ""} aria-hidden="true">
          {token}{index < tokens.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
