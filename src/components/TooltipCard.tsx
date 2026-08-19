import { useId, useState, type ReactNode, type KeyboardEvent } from "react";

interface TooltipCardProps {
  children: ReactNode;
  content: ReactNode;
  className?: string;
  containerClassName?: string;
}

export default function TooltipCard({ children, content, className = "", containerClassName = "" }: TooltipCardProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((value) => !value);
    }
    if (event.key === "Escape") setOpen(false);
  };

  return (
    <span
      className={`tooltip-card-trigger ${containerClassName}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <span
        className={`tooltip-card-label ${className}`}
        role="button"
        tabIndex={0}
        aria-describedby={open ? id : undefined}
        onKeyDown={handleKeyDown}
      >
        {children}
      </span>
      <span id={id} role="tooltip" className={`tooltip-card-content ${open ? "is-open" : ""}`}>
        {content}
      </span>
    </span>
  );
}
