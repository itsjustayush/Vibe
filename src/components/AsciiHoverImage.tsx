import { useRef, type ImgHTMLAttributes, type PointerEvent } from "react";

const ASCII_CHARS = "@#S%?*+;:,. ";

type PointerPosition = { x: number; y: number };

interface AsciiHoverImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  label?: string;
}

export default function AsciiHoverImage({ label = "ASCII hover field", className = "", ...props }: AsciiHoverImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<PointerPosition>({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  const renderAscii = () => {
    frameRef.current = null;
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !image.complete || !image.naturalWidth) return;

    const rect = image.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
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

  const scheduleRender = () => {
    if (frameRef.current === null) frameRef.current = window.requestAnimationFrame(renderAscii);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    scheduleRender();
  };

  const handlePointerLeave = () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div
      className="ascii-hover-image relative h-full w-full overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      data-label={label}
    >
      <img ref={imageRef} {...props} className={className} />
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 opacity-95 mix-blend-screen" />
      <span className="ascii-hover-hint pointer-events-none absolute bottom-3 left-3 z-20 border border-white/30 bg-black/45 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
        Move to decode
      </span>
    </div>
  );
}
