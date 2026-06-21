/**
 * High-performance client-side Canvas image compressor
 * Downscales images to realistic portfolio dimension sizes (e.g., max 1000px)
 * and recompresses them to JPEG format (0.75 quality) to ensure they are extremely light.
 */
export interface CompressionResult {
  base64: string;
  originalSize: number;
  compressedSize: number;
  ratio: number; // percentage saved
}

export function compressImage(
  base64OrFile: string | File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const processBase64 = (base64Str: string) => {
      if (!base64Str.startsWith("data:image")) {
        // If not a standard base64 data URI (e.g. an external public URL), return default metadata values
        resolve({
          base64: base64Str,
          originalSize: base64Str.length,
          compressedSize: base64Str.length,
          ratio: 0,
        });
        return;
      }

      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Scale keeping aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve({
            base64: base64Str,
            originalSize: base64Str.length,
            compressedSize: base64Str.length,
            ratio: 0,
          });
          return;
        }

        // Draw image keeping orientation and proportions
        ctx.drawImage(img, 0, 0, width, height);

        // --- AUTOMATIC COPYRIGHT WATERMARK INJECTION ---
        // Dynamically calculate scale based on image dimensions so it is consistently scaled and discreet
        const scaleFactor = Math.min(width, height) / 800; // calibrated for 800px base
        const docFontSize = Math.max(10, Math.round(13 * scaleFactor));
        
        ctx.save();
        
        // Let's create an elegant, glassmorphic dark brand badge in the bottom right corner
        const text = "© AYU.VIBEE PHOTOGRAPHY";
        ctx.font = `bold ${docFontSize}px "Inter", "Helvetica Neue", sans-serif`;
        
        // Measure exact text to center or size badge
        const textWidth = ctx.measureText(text).width;
        const badgeWidth = textWidth + (docFontSize * 3);
        const badgeHeight = docFontSize * 2.2;
        
        // Position at bottom-right with spacing relative to scale
        const x = width - badgeWidth - (20 * scaleFactor);
        const y = height - badgeHeight - (20 * scaleFactor);
        
        // 1. Semi-transparent dark glass backdrop
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, badgeWidth, badgeHeight, 5 * scaleFactor);
        } else {
          ctx.rect(x, y, badgeWidth, badgeHeight);
        }
        ctx.fill();
        
        // 2. Gold brand accent highlight on the left boundary
        ctx.fillStyle = "#eab308"; // premium gold color
        ctx.fillRect(x, y + 2, 2.5 * scaleFactor, badgeHeight - 4);
        
        // 3. Shutter aperture brand icon inside badge
        const apertureX = x + (docFontSize * 1.3);
        const apertureY = y + (badgeHeight / 2);
        const apertureRadius = docFontSize * 0.45;
        
        // Outer gold circle ring
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = Math.max(1, 1.2 * scaleFactor);
        ctx.beginPath();
        ctx.arc(apertureX, apertureY, apertureRadius, 0, 2 * Math.PI);
        ctx.stroke();

        // Inner camera void center dot
        ctx.fillStyle = "#eab308";
        ctx.beginPath();
        ctx.arc(apertureX, apertureY, apertureRadius * 0.3, 0, 2 * Math.PI);
        ctx.fill();
        
        // 4. White corporate text
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 4 * scaleFactor;
        ctx.textBaseline = "middle";
        ctx.fillText(text, x + (docFontSize * 2.4), y + (badgeHeight / 2));
        
        ctx.restore();
        // -----------------------------------------------

        // Convert to highly optimized, compact JPEG format
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        const originalSize = base64Str.length;
        const compressedSize = compressedDataUrl.length;
        const ratio = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

        resolve({
          base64: compressedDataUrl,
          originalSize,
          compressedSize,
          ratio,
        });
      };

      img.onerror = (err) => {
        console.warn("Client-side image optimizer failed, storing raw uncompressed format:", err);
        resolve({
          base64: base64Str,
          originalSize: base64Str.length,
          compressedSize: base64Str.length,
          ratio: 0,
        });
      };
    };

    if (base64OrFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processBase64(reader.result as string);
      };
      reader.onerror = (err) => {
        reject(err);
      };
      reader.readAsDataURL(base64OrFile);
    } else {
      processBase64(base64OrFile);
    }
  });
}

/**
 * Format raw base64 or file bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
