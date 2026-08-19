import { useEffect, useState, type ReactNode } from "react";

export default function ResizableNavbar({ children }: { children: ReactNode }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => setCompact(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <div className={`resizable-navbar-shell ${compact ? "is-compact" : ""}`}>{children}</div>;
}
