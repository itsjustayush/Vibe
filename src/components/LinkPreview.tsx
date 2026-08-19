import { useState, type ReactNode } from "react";

interface LinkPreviewProps {
  url: string;
  children: ReactNode;
  className?: string;
}

export default function LinkPreview({ url, children, className = "" }: LinkPreviewProps) {
  const [open, setOpen] = useState(false);
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  })();

  return (
    <span
      className="link-preview-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <a className={`link-preview-trigger ${className}`} href={url} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
      <span className={`link-preview-card ${open ? "is-open" : ""}`} role="tooltip">
        <span className="link-preview-kicker">External link</span>
        <strong>{hostname}</strong>
        <span>{url}</span>
      </span>
    </span>
  );
}
