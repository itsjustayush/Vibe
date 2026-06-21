import React, { useEffect, useRef } from "react";

interface SpiralLoaderProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function SpiralLoader({ size = 180, className = "", showText = true }: SpiralLoaderProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const config = {
    rotate: true,
    particleCount: 86,
    trailSpan: 0.34,
    durationMs: 4600,
    rotationDurationMs: 28000,
    pulseDurationMs: 4200,
    strokeWidth: 4.4,
    spiralR: 6,
    spiralr: 1,
    spirald: 3,
    spiralScale: 2.2,
    spiralBreath: 0.45,
    point(progress: number, detailScale: number) {
      const t = progress * Math.PI * 2;
      const d = this.spirald + detailScale * 0.25;
      const baseX = (this.spiralR - this.spiralr) * Math.cos(t) + d * Math.cos(((this.spiralR - this.spiralr) / this.spiralr) * t);
      const baseY = (this.spiralR - this.spiralr) * Math.sin(t) - d * Math.sin(((this.spiralR - this.spiralr) / this.spiralr) * t);
      const scale = this.spiralScale + detailScale * this.spiralBreath;
      return {
        x: 50 + baseX * scale,
        y: 50 + baseY * scale,
      };
    },
  };

  useEffect(() => {
    const svgNode = svgRef.current;
    const pathNode = pathRef.current;
    const groupNode = groupRef.current;
    if (!svgNode || !pathNode || !groupNode) return;

    // Create the particles
    const circles: SVGCircleElement[] = [];
    for (let i = 0; i < config.particleCount; i++) {
       const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
       circle.setAttribute("fill", "currentColor");
       groupNode.appendChild(circle);
       circles.push(circle);
    }

    // Set path stroke-width
    pathNode.setAttribute("stroke-width", String(config.strokeWidth));

    function normalizeProgress(progress: number) {
      return ((progress % 1) + 1) % 1;
    }

    function getDetailScale(time: number) {
      const pulseProgress = (time % config.pulseDurationMs) / config.pulseDurationMs;
      const pulseAngle = pulseProgress * Math.PI * 2;
      return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48;
    }

    function getRotation(time: number) {
      if (!config.rotate) return 0;
      return -((time % config.rotationDurationMs) / config.rotationDurationMs) * 360;
    }

    function buildPath(detailScale: number, steps = 480) {
      return Array.from({ length: steps + 1 }, (_, index) => {
        const point = config.point(index / steps, detailScale);
        return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      }).join(" ");
    }

    function getParticle(index: number, progress: number, detailScale: number) {
      const tailOffset = index / (config.particleCount - 1);
      const point = config.point(normalizeProgress(progress - tailOffset * config.trailSpan), detailScale);
      const fade = Math.pow(1 - tailOffset, 0.56);
      return {
        x: point.x,
        y: point.y,
        radius: 0.9 + fade * 2.7,
        opacity: 0.04 + fade * 0.96,
      };
    }

    const startedAt = performance.now();

    function render(now: number) {
      const time = now - startedAt;
      const progress = (time % config.durationMs) / config.durationMs;
      const detailScale = getDetailScale(time);

      groupNode?.setAttribute("transform", `rotate(${getRotation(time)} 50 50)`);
      pathNode?.setAttribute("d", buildPath(detailScale));
      
      circles.forEach((node, index) => {
        const particle = getParticle(index, progress, detailScale);
        node.setAttribute("cx", particle.x.toFixed(2));
        node.setAttribute("cy", particle.y.toFixed(2));
        node.setAttribute("r", particle.radius.toFixed(2));
        node.setAttribute("opacity", particle.opacity.toFixed(3));
      });

      animationFrameRef.current = requestAnimationFrame(render);
    }

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up particles
      circles.forEach((circle) => {
        if (groupNode.contains(circle)) {
          groupNode.removeChild(circle);
        }
      });
    };
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className="relative grid place-items-center" 
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg 
          ref={svgRef}
          viewBox="0 0 100 100" 
          fill="none" 
          aria-hidden="true" 
          className="w-full h-full overflow-visible text-[#1a1a1a]"
        >
          <g ref={groupRef} id="group">
            <path 
              ref={pathRef}
              id="path" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity="0.08"
            />
          </g>
        </svg>
      </div>
      {showText && (
        <div className="mt-4 text-center">
          <p className="font-serif text-lg tracking-[0.1em] text-[#1a1a1a] font-medium">Six-Petal Spiral</p>
          <p className="font-mono text-[10px] tracking-widest text-[#5f5e59] uppercase mt-1">R = 6, r = 1, d = 3</p>
        </div>
      )}
    </div>
  );
}
