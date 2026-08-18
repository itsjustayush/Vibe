import { useEffect, useRef, type ImgHTMLAttributes, type PointerEvent } from "react";

const ASCII_CHARS = "@#S%?*+;:,. ";

type PointerPosition = { x: number; y: number };
type CanvasSize = { width: number; height: number; pixelRatio: number };

interface AsciiHoverImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  label?: string;
}

function getReducedMotionPreference() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AsciiHoverImage({ label = "ASCII hover field", className = "", ...props }: AsciiHoverImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const asciiCanvasRef = useRef<HTMLCanvasElement>(null);
  const textureCanvasRef = useRef<HTMLCanvasElement>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<PointerPosition>({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const reducedMotionRef = useRef(getReducedMotionPreference());
  const sizeRef = useRef<CanvasSize | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handlePreferenceChange = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };

    mediaQuery.addEventListener("change", handlePreferenceChange);
    return () => mediaQuery.removeEventListener("change", handlePreferenceChange);
  }, []);

  const syncCanvasSize = () => {
    const image = imageRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    const textureCanvas = textureCanvasRef.current;
    if (!image || !asciiCanvas || !textureCanvas) return null;

    const rect = image.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const previous = sizeRef.current;

    if (!previous || previous.width !== width || previous.height !== height || previous.pixelRatio !== pixelRatio) {
      asciiCanvas.width = Math.floor(width * pixelRatio);
      asciiCanvas.height = Math.floor(height * pixelRatio);
      textureCanvas.width = Math.floor(width * pixelRatio);
      textureCanvas.height = Math.floor(height * pixelRatio);
      asciiCanvas.style.width = `${width}px`;
      asciiCanvas.style.height = `${height}px`;
      textureCanvas.style.width = `${width}px`;
      textureCanvas.style.height = `${height}px`;
      sizeRef.current = { width, height, pixelRatio };
    }

    return sizeRef.current;
  };

  const renderAscii = () => {
    const image = imageRef.current;
    const canvas = asciiCanvasRef.current;
    const size = syncCanvasSize();
    if (!image || !canvas || !size || !image.complete || !image.naturalWidth) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const { width, height, pixelRatio } = size;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const sampleCanvas = sampleCanvasRef.current || document.createElement("canvas");
    sampleCanvasRef.current = sampleCanvas;
    sampleCanvas.width = width;
    sampleCanvas.height = height;
    const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
    if (!sampleContext) return;
    sampleContext.drawImage(image, 0, 0, width, height);
    const pixels = sampleContext.getImageData(0, 0, width, height).data;

    const { x, y } = pointerRef.current;
    const radius = Math.min(width, height) * 0.44;
    const cellSize = Math.max(7, Math.round(Math.min(width, height) / 38));
    context.font = `${cellSize}px "IBM Plex Mono", ui-monospace, monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ascii-color").trim() || "#18181b";

    const startRow = Math.max(0, Math.floor((y - radius) / cellSize));
    const endRow = Math.min(Math.ceil(height / cellSize), Math.ceil((y + radius) / cellSize));
    const startColumn = Math.max(0, Math.floor((x - radius) / cellSize));
    const endColumn = Math.min(Math.ceil(width / cellSize), Math.ceil((x + radius) / cellSize));

    for (let row = startRow; row <= endRow; row += 1) {
      for (let column = startColumn; column <= endColumn; column += 1) {
        const drawX = column * cellSize;
        const drawY = row * cellSize;
        const distance = Math.hypot(drawX - x, drawY - y);
        if (distance > radius) continue;

        const sampleX = Math.min(width - 1, Math.max(0, Math.floor(drawX)));
        const sampleY = Math.min(height - 1, Math.max(0, Math.floor(drawY)));
        const pixelIndex = (sampleY * width + sampleX) * 4;
        const luminance = pixels[pixelIndex] * 0.2126 + pixels[pixelIndex + 1] * 0.7152 + pixels[pixelIndex + 2] * 0.0722;
        const character = ASCII_CHARS[Math.min(ASCII_CHARS.length - 1, Math.floor(((255 - luminance) / 255) * (ASCII_CHARS.length - 1)))];
        if (character === " ") continue;

        context.globalAlpha = Math.min(0.96, (1 - distance / radius) * 0.96);
        context.fillText(character, drawX, drawY);
      }
    }
    context.globalAlpha = 1;
  };

  const renderTexture = (timestamp: number) => {
    const canvas = textureCanvasRef.current;
    const size = syncCanvasSize();
    if (!canvas || !size) return;

    const context = canvas.getContext("2d");
    if (!context) return;
    const { width, height, pixelRatio } = size;
    const { x, y } = pointerRef.current;
    const time = timestamp * 0.001;
    const motion = reducedMotionRef.current ? 0 : time;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);

    const lensX = x + Math.sin(motion * 1.4) * 5;
    const lensY = y + Math.cos(motion * 1.1) * 4;
    const lensRadius = Math.min(width, height) * 0.48;
    const lens = context.createRadialGradient(lensX, lensY, 0, lensX, lensY, lensRadius);
    lens.addColorStop(0, "rgba(243, 192, 92, 0.20)");
    lens.addColorStop(0.42, "rgba(243, 192, 92, 0.06)");
    lens.addColorStop(0.72, "rgba(13, 13, 13, 0.06)");
    lens.addColorStop(1, "rgba(13, 13, 13, 0)");
    context.fillStyle = lens;
    context.fillRect(0, 0, width, height);

    context.save();
    context.globalAlpha = 0.18;
    context.strokeStyle = "rgba(255, 255, 255, 0.48)";
    context.lineWidth = 1;
    for (let offset = 0; offset < 4; offset += 1) {
      const scanY = ((y + offset * 5 + motion * 12) % (height + 18)) - 9;
      context.fillStyle = "rgba(255, 255, 255, 0.18)";
      context.fillRect(0, scanY, width, 1);
    }

    context.globalAlpha = 0.28;
    context.setLineDash([2, 5]);
    for (let ring = 1; ring <= 3; ring += 1) {
      context.beginPath();
      context.arc(lensX, lensY, Math.min(width, height) * (0.11 + ring * 0.075) + Math.sin(motion + ring) * 3, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();

    context.save();
    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.16;
    for (let grain = 0; grain < 280; grain += 1) {
      const grainX = (grain * 83 + Math.floor(motion * 38)) % width;
      const grainY = (grain * 47 + Math.floor(motion * 22)) % height;
      const grainSize = grain % 7 === 0 ? 2 : 1;
      context.fillStyle = grain % 3 === 0 ? "rgba(244, 195, 106, 0.7)" : "rgba(255, 255, 255, 0.42)";
      context.fillRect(grainX, grainY, grainSize, grainSize);
    }
    context.restore();
  };

  const renderFrame = (timestamp: number) => {
    frameRef.current = null;
    if (!activeRef.current) return;

    const image = imageRef.current;
    const size = syncCanvasSize();
    if (image && size) {
      const offsetX = ((pointerRef.current.x / size.width) - 0.5) * -10;
      const offsetY = ((pointerRef.current.y / size.height) - 0.5) * -8;
      const tilt = ((pointerRef.current.x / size.width) - 0.5) * 1.25;
      image.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(1.035) rotate(${tilt}deg)`;
    }

    renderTexture(timestamp);
    renderAscii();

    if (!reducedMotionRef.current) {
      frameRef.current = window.requestAnimationFrame(renderFrame);
    }
  };

  const scheduleRender = () => {
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(renderFrame);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    activeRef.current = true;
    scheduleRender();
  };

  const handlePointerLeave = () => {
    activeRef.current = false;
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;

    const image = imageRef.current;
    const asciiCanvas = asciiCanvasRef.current;
    const textureCanvas = textureCanvasRef.current;
    image?.style.removeProperty("transform");
    asciiCanvas?.getContext("2d")?.clearRect(0, 0, asciiCanvas.width, asciiCanvas.height);
    textureCanvas?.getContext("2d")?.clearRect(0, 0, textureCanvas.width, textureCanvas.height);
  };

  return (
    <div
      className="ascii-hover-image relative h-full w-full overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-label={label}
    >
      <img ref={imageRef} {...props} className={`hero-texture-image ${className}`} />
      <canvas ref={textureCanvasRef} aria-hidden="true" className="hero-texture-canvas pointer-events-none absolute inset-0 z-10 opacity-90 mix-blend-screen" />
      <canvas ref={asciiCanvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 opacity-95 mix-blend-screen" />
      <span className="ascii-hover-hint pointer-events-none absolute bottom-3 left-3 z-30 border border-white/30 bg-black/45 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
        Move to decode
      </span>
    </div>
  );
}
