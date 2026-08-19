import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

interface WobbleCardProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export default function WobbleCard({ children, className = "", containerClassName = "" }: WobbleCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -3;
    const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 3;
    ref.current?.style.setProperty("--wobble-transform", `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`);
  };

  const handlePointerLeave = () => {
    ref.current?.style.setProperty("--wobble-transform", "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)");
  };

  const style = { "--wobble-transform": "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)" } as CSSProperties;

  return (
    <div
      ref={ref}
      style={style}
      className={`wobble-card ${containerClassName}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className={`wobble-card-inner ${className}`}>{children}</div>
    </div>
  );
}
