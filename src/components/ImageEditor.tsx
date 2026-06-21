import React, { useState, useEffect, useRef } from "react";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedBase64: string) => void;
  onClose: () => void;
}

type AspectRatio = "free" | "1:1" | "4:5" | "16:10" | "3:2";

export default function ImageEditor({ imageUrl, onSave, onClose }: ImageEditorProps) {
  const [rotation, setRotation] = useState<number>(0); // degrees, multiples of 90
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [activeAspect, setActiveAspect] = useState<AspectRatio>("free");
  
  // Watermark options
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [watermarkTheme, setWatermarkTheme] = useState<"light" | "dark">("dark");
  const [watermarkPosition, setWatermarkPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "center">("bottom-right");
  const [watermarkScale, setWatermarkScale] = useState<number>(1);

  // States for interactive cropping
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 10,
    y: 10,
    w: 80,
    h: 80,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgDims, setImgDims] = useState({ displayWidth: 0, displayHeight: 0 });
  const [dragState, setDragState] = useState<{
    type: "move" | "resize-nw" | "resize-ne" | "resize-sw" | "resize-se" | null;
    startX: number;
    startY: number;
    startBox: { x: number; y: number; w: number; h: number };
  }>({
    type: null,
    startX: 0,
    startY: 0,
    startBox: { x: 0, y: 0, w: 0, h: 0 },
  });

  // Load image dimensions on wrapper
  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgDims({
        displayWidth: imgRef.current.clientWidth,
        displayHeight: imgRef.current.clientHeight,
      });
      // Set reasonable initial crop box
      setCropBox({
        x: imgRef.current.clientWidth * 0.1,
        y: imgRef.current.clientHeight * 0.1,
        w: imgRef.current.clientWidth * 0.8,
        h: imgRef.current.clientHeight * 0.8,
      });
    }
  };

  useEffect(() => {
    // Reset state when imageUrl changes
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setIsCropping(false);
  }, [imageUrl]);

  // Handle resizing of screen/containers
  useEffect(() => {
    const handleResize = () => {
      if (imgRef.current) {
        setImgDims({
          displayWidth: imgRef.current.clientWidth,
          displayHeight: imgRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update crop box ratio if aspect changes
  useEffect(() => {
    if (activeAspect === "free" || !imgDims.displayWidth) return;
    
    let ratio = 1;
    if (activeAspect === "1:1") ratio = 1;
    else if (activeAspect === "4:5") ratio = 4 / 5;
    else if (activeAspect === "16:10") ratio = 16 / 10;
    else if (activeAspect === "3:2") ratio = 3 / 2;

    const currentW = cropBox.w;
    let targetH = currentW / ratio;

    // Constrain to container boundaries
    if (cropBox.y + targetH > imgDims.displayHeight) {
      targetH = imgDims.displayHeight - cropBox.y;
      const targetW = targetH * ratio;
      setCropBox(prev => ({
        ...prev,
        w: Math.min(targetW, imgDims.displayWidth - prev.x),
        h: targetH
      }));
    } else {
      setCropBox(prev => ({
        ...prev,
        h: targetH
      }));
    }
  }, [activeAspect, imgDims.displayWidth]);

  // Crop drag/resize mouse handlers
  const onMouseDown = (e: React.MouseEvent, type: typeof dragState.type) => {
    e.preventDefault();
    setDragState({
      type,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...cropBox },
    });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragState.type || !imgDims.displayWidth) return;
    
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const start = dragState.startBox;
    let newBox = { ...cropBox };

    let ratio = 0;
    if (activeAspect === "1:1") ratio = 1;
    else if (activeAspect === "4:5") ratio = 4 / 5;
    else if (activeAspect === "16:10") ratio = 16 / 10;
    else if (activeAspect === "3:2") ratio = 3 / 2;

    if (dragState.type === "move") {
      newBox.x = Math.max(0, Math.min(imgDims.displayWidth - start.w, start.x + dx));
      newBox.y = Math.max(0, Math.min(imgDims.displayHeight - start.h, start.y + dy));
    } else if (dragState.type === "resize-se") {
      const targetW = Math.max(30, Math.min(imgDims.displayWidth - start.x, start.w + dx));
      if (ratio) {
        const targetH = targetW / ratio;
        if (start.y + targetH <= imgDims.displayHeight) {
          newBox.w = targetW;
          newBox.h = targetH;
        }
      } else {
        newBox.w = targetW;
        newBox.h = Math.max(30, Math.min(imgDims.displayHeight - start.y, start.h + dy));
      }
    } else if (dragState.type === "resize-sw") {
      const maxW = start.x + start.w;
      const targetW = Math.max(30, Math.min(maxW, start.w - dx));
      const calculatedX = maxW - targetW;
      
      if (ratio) {
        const targetH = targetW / ratio;
        if (start.y + targetH <= imgDims.displayHeight) {
          newBox.x = calculatedX;
          newBox.w = targetW;
          newBox.h = targetH;
        }
      } else {
        newBox.x = calculatedX;
        newBox.w = targetW;
        newBox.h = Math.max(30, Math.min(imgDims.displayHeight - start.y, start.h + dy));
      }
    } else if (dragState.type === "resize-ne") {
      // Top right
      const targetW = Math.max(30, Math.min(imgDims.displayWidth - start.x, start.w + dx));
      if (ratio) {
        const targetH = targetW / ratio;
        const calculatedY = (start.y + start.h) - targetH;
        if (calculatedY >= 0) {
          newBox.y = calculatedY;
          newBox.w = targetW;
          newBox.h = targetH;
        }
      } else {
        const maxH = start.y + start.h;
        const targetH = Math.max(30, Math.min(maxH, start.h - dy));
        newBox.y = maxH - targetH;
        newBox.w = targetW;
        newBox.h = targetH;
      }
    } else if (dragState.type === "resize-nw") {
      // Top left
      const maxW = start.x + start.w;
      const targetW = Math.max(30, Math.min(maxW, start.w - dx));
      const calculatedX = maxW - targetW;

      if (ratio) {
        const targetH = targetW / ratio;
        const calculatedY = (start.y + start.h) - targetH;
        if (calculatedY >= 0) {
          newBox.x = calculatedX;
          newBox.y = calculatedY;
          newBox.w = targetW;
          newBox.h = targetH;
        }
      } else {
        const maxH = start.y + start.h;
        const targetH = Math.max(30, Math.min(maxH, start.h - dy));
        newBox.x = calculatedX;
        newBox.y = maxH - targetH;
        newBox.w = targetW;
        newBox.h = targetH;
      }
    }

    setCropBox(newBox);
  };

  const onMouseUp = () => {
    setDragState({
      type: null,
      startX: 0,
      startY: 0,
      startBox: { x: 0, y: 0, w: 0, h: 0 },
    });
  };

  // SVG-based Aperture icon drawing on Canvas matching client logos
  const drawApertureLogo = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    theme: "light" | "dark"
  ) => {
    ctx.save();
    
    // Core parameters based on scale
    const radius = 16 * scale;
    const itemGap = 6.5 * scale;
    
    // Color schemes
    const brandGold = "#EAB308"; // Primary shining golden-yellow color in actual logos
    const brandText = theme === "light" ? "#F7F4ED" : "#1A1A17"; // Off-white vs Soft deep-charcoal black

    // 1. Draw shutter aperture circles/blades
    ctx.translate(x, y);
    
    // Outer golden ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = radius * 0.15;
    ctx.strokeStyle = brandGold;
    ctx.stroke();

    // Golden blades
    const numBlades = 6;
    const step = (Math.PI * 2) / numBlades;
    for (let i = 0; i < numBlades; i++) {
      const angle = i * step;
      const r1 = radius * 0.95;
      const r2 = radius * 0.28;
      
      const x1 = Math.cos(angle) * r1;
      const y1 = Math.sin(angle) * r1;
      const x2 = Math.cos(angle + step * 0.9) * r2;
      const y2 = Math.sin(angle + step * 0.9) * r2;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = radius * 0.12;
      ctx.strokeStyle = brandGold;
      ctx.stroke();
    }
    
    // 2. Draw Text "av" and "PHOTOGRAPHY"
    ctx.translate(0, radius + 22 * scale);
    
    // "av" Logo Lettering - Elegant Serif
    ctx.font = `italic 600 ${28 * scale}px Georgia, "Playfair Display", serif`;
    ctx.fillStyle = brandText;
    ctx.textAlign = "center";
    ctx.fillText("av", 0, 0);

    // "PHOTOGRAPHY" text - Clean Sans-serif with tight elegant tracking
    ctx.translate(0, 16 * scale);
    ctx.font = `600 ${9 * scale}px "Inter", sans-serif`;
    ctx.fillStyle = brandText;
    ctx.textAlign = "center";
    
    // Custom tracking
    const textLabel = "PHOTOGRAPHY";
    const letterSpacing = 2.5 * scale;
    const totalW = ctx.measureText(textLabel).width + (textLabel.length - 1) * letterSpacing;
    let startTextX = -totalW / 2 + letterSpacing / 2;
    
    for (let j = 0; j < textLabel.length; j++) {
      ctx.fillText(textLabel[j], startTextX + j * (ctx.measureText(textLabel[j]).width + letterSpacing), 0);
    }

    ctx.restore();
  };

  // Process and produce output
  const handleApplyEdits = () => {
    const rawImg = new Image();
    rawImg.src = imageUrl;
    
    rawImg.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Calculate initial rotation dimensions
      const is90Rotated = (rotation / 90) % 2 !== 0;
      let origW = rawImg.width;
      let origH = rawImg.height;

      // Define internal offscreen canvas to process crop first
      let croppedW = origW;
      let croppedH = origH;
      let cropX = 0;
      let cropY = 0;

      if (isCropping && imgDims.displayWidth) {
        // Map proportional crop box back to the raw image resolution
        const scaleX = origW / imgDims.displayWidth;
        const scaleY = origH / imgDims.displayHeight;

        cropX = Math.round(cropBox.x * scaleX);
        cropY = Math.round(cropBox.y * scaleY);
        croppedW = Math.round(cropBox.w * scaleX);
        croppedH = Math.round(cropBox.h * scaleY);
      }

      // Compute physical size after rotating the chopped fragment
      const finalCanvasW = is90Rotated ? croppedH : croppedW;
      const finalCanvasH = is90Rotated ? croppedW : croppedH;

      canvas.width = finalCanvasW;
      canvas.height = finalCanvasH;

      // Set canvas transformations
      ctx.translate(finalCanvasW / 2, finalCanvasH / 2);

      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);

      // Flip H/V
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Draw truncated image portion
      ctx.drawImage(
        rawImg,
        cropX,
        cropY,
        croppedW,
        croppedH,
        -croppedW / 2,
        -croppedH / 2,
        croppedW,
        croppedH
      );

      // Remove transformations to draw watermark on absolute flat space
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Add Copyright Watermark Logo
      if (showWatermark) {
        // Base coordinate positioning
        const pad = Math.min(canvas.width, canvas.height) * 0.08;
        const scale = (Math.min(canvas.width, canvas.height) / 500) * watermarkScale;
        
        let wx = canvas.width - pad;
        let wy = canvas.height - pad * 1.5;

        if (watermarkPosition === "bottom-left") {
          wx = pad;
        } else if (watermarkPosition === "top-right") {
          wy = pad * 1.3;
        } else if (watermarkPosition === "center") {
          wx = canvas.width / 2;
          wy = canvas.height / 2;
        }

        drawApertureLogo(ctx, wx, wy, scale, watermarkTheme);
      }

      // Dynamic quality compression
      const finalBase64 = canvas.toDataURL("image/jpeg", 0.85);
      onSave(finalBase64);
    };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="bg-[#f7f4ed] w-full max-w-5xl rounded-none border border-[#e5e1d8] shadow-2xl flex flex-col max-h-[92vh] text-black"
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Header toolbar */}
        <div className="p-4 border-b border-[#e5e1d8] flex justify-between items-center bg-white">
          <div>
            <h3 className="font-serif text-sm tracking-widest uppercase font-bold text-black flex items-center gap-2">
              <span className="material-symbols-outlined text-[#eab308] text-base">architecture</span>
              IN-SITE PHOTOGRAPHIC PORT WORKSPACE
            </h3>
            <p className="font-mono text-[8px] text-[#8b8780] uppercase tracking-wider mt-0.5">Crop, Transpose, Align & Safeguard Content</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none border border-[#e5e1d8] hover:border-black flex items-center justify-center transition-colors hover:bg-black hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Workspace body */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-12 overflow-hidden h-full">
          
          {/* Main Stage View */}
          <div ref={containerRef} className="md:col-span-8 p-4 bg-[#111] flex items-center justify-center relative overflow-hidden select-none min-h-[300px]">
            <div className="relative max-w-full max-h-[58vh]">
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Source Asset"
                onLoad={handleImageLoad}
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  transition: "transform 0.2s ease",
                }}
                className="max-h-[56vh] object-contain mx-auto select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />

              {/* Crop Box Overlay */}
              {isCropping && imgDims.displayWidth > 0 && (
                <div 
                  className="absolute border-2 border-dashed border-[#eab308] bg-black/20"
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.w}px`,
                    height: `${cropBox.h}px`,
                  }}
                  onMouseDown={(e) => onMouseDown(e, "move")}
                >
                  {/* Grid Lines inside crop area */}
                  <div className="absolute inset-0 grid grid-cols-3 divide-x divide-white/20 select-none pointer-events-none">
                    <div />
                    <div />
                    <div />
                  </div>
                  <div className="absolute inset-0 grid grid-rows-3 divide-y divide-white/20 select-none pointer-events-none">
                    <div />
                    <div />
                    <div />
                  </div>

                  {/* Corner Resize Handles */}
                  <div 
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-[#eab308] cursor-nw-resize z-10"
                    onMouseDown={(e) => onMouseDown(e, "resize-nw")}
                  />
                  <div 
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-[#eab308] cursor-ne-resize z-10"
                    onMouseDown={(e) => onMouseDown(e, "resize-ne")}
                  />
                  <div 
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border border-[#eab308] cursor-sw-resize z-10"
                    onMouseDown={(e) => onMouseDown(e, "resize-sw")}
                  />
                  <div 
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border border-[#eab308] cursor-se-resize z-10"
                    onMouseDown={(e) => onMouseDown(e, "resize-se")}
                  />
                </div>
              )}
            </div>
            
            <div className="absolute bottom-3 left-4 font-mono text-[9px] text-[#888] flex items-center gap-2 uppercase tracking-widest bg-black/40 px-2 py-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 inline-block animate-pulse"></span>
              Live Sandbox Port active
            </div>
          </div>

          {/* Side Control Cabinet */}
          <div className="md:col-span-4 p-5 overflow-y-auto max-h-full border-t md:border-t-0 md:border-l border-[#e5e1d8] flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              {/* Transform Category */}
              <div>
                <span className="font-mono text-[9px] tracking-widest text-[#8b8780] uppercase mb-2 block font-semibold">GEOMETRIC TRANSPOSE</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="py-2 border border-[#e5e1d8] hover:border-black font-sans text-xs flex flex-col items-center justify-center gap-1 hover:bg-neutral-50 px-1"
                    title="Rotate 90 degrees right"
                  >
                    <span className="material-symbols-outlined text-base">rotate_right</span>
                    <span className="font-mono text-[8px] uppercase tracking-wider">Rotate 90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipH(prev => !prev)}
                    className={`py-2 border font-sans text-xs flex flex-col items-center justify-center gap-1 px-1 transition-all ${
                      flipH ? "border-black bg-black text-[#f7f4ed]" : "border-[#e5e1d8] hover:border-black hover:bg-neutral-50"
                    }`}
                    title="Flip Horizontally"
                  >
                    <span className="material-symbols-outlined text-base">flip</span>
                    <span className="font-mono text-[8px] uppercase tracking-wider">Flip Horiz</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipV(prev => !prev)}
                    className={`py-2 border font-sans text-xs flex flex-col items-center justify-center gap-1 px-1 transition-all ${
                      flipV ? "border-black bg-black text-[#f7f4ed]" : "border-[#e5e1d8] hover:border-black hover:bg-neutral-50"
                    }`}
                    title="Flip Vertically"
                  >
                    <span className="material-symbols-outlined text-base" style={{ transform: "rotate(90deg)" }}>flip</span>
                    <span className="font-mono text-[8px] uppercase tracking-wider">Flip Vert</span>
                  </button>
                </div>
              </div>

              {/* Crop Suite */}
              <div className="p-3 border border-[#e5e1d8] bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9px] tracking-widest text-[#5f5e59] uppercase block font-semibold">CROP ENVELOPE</span>
                  <button
                    type="button"
                    onClick={() => setIsCropping(prev => !prev)}
                    className={`px-3 py-1 text-[8px] font-mono border transition-all ${
                      isCropping 
                        ? "border-[#eab308] bg-[#eab308]/10 text-amber-800 font-bold" 
                        : "border-[#e5e1d8] hover:border-black"
                    }`}
                  >
                    {isCropping ? "DISABLE CROP AREA" : "ENABLE CROP OVERLAY"}
                  </button>
                </div>

                {isCropping && (
                  <div className="space-y-2 pt-1">
                    <span className="font-mono text-[8px] text-[#8b8780] block uppercase tracking-wider">CHOOSE FIXED RATIO ATTAINMENT</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(["free", "1:1", "4:5", "16:10", "3:2"] as AspectRatio[]).map((aspect) => (
                        <button
                          key={aspect}
                          type="button"
                          onClick={() => setActiveAspect(aspect)}
                          className={`px-2 py-1 text-[8px] font-mono border uppercase tracking-wider transition-colors ${
                            activeAspect === aspect 
                              ? "border-black bg-neutral-900 text-white font-bold" 
                              : "border-neutral-200 hover:border-black bg-[#faf9f6]"
                          }`}
                        >
                          {aspect}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Copyright Protection Panel */}
              <div className="p-3 border border-[#e5e1d8] bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono text-[9px] tracking-widest text-[#eab308] uppercase block font-semibold">COPYRIGHT ASSURANCE</span>
                    <span className="font-sans text-[10px] text-[#8b8780] block">Burn official artist watermark signature</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="w-4 h-4 text-black cursor-pointer bg-[#faf9f6]"
                  />
                </div>

                {showWatermark && (
                  <div className="space-y-3 pt-2 border-t border-dashed border-[#e5e1d8]">
                    {/* Theme Choice - Light vs Dark */}
                    <div>
                      <span className="font-mono text-[8px] text-[#8b8780] uppercase tracking-wider block mb-1">SIGNATURE THEME</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setWatermarkTheme("light")}
                          className={`py-1 text-[9px] font-mono border text-center transition-colors ${
                            watermarkTheme === "light" 
                              ? "border-black bg-neutral-50 text-black font-semibold" 
                              : "border-neutral-200 text-[#5f5e59] bg-[#faf9f6] hover:border-black"
                          }`}
                        >
                          LIGHT (CREAM & GOLD)
                        </button>
                        <button
                          type="button"
                          onClick={() => setWatermarkTheme("dark")}
                          className={`py-1 text-[9px] font-mono border text-center transition-colors ${
                            watermarkTheme === "dark" 
                              ? "border-black bg-neutral-50 text-black font-semibold" 
                              : "border-neutral-200 text-[#5f5e59] bg-[#faf9f6] hover:border-black"
                          }`}
                        >
                          DARK (CHARCOAL & GOLD)
                        </button>
                      </div>
                    </div>

                    {/* Position */}
                    <div>
                      <span className="font-mono text-[8px] text-[#8b8780] uppercase tracking-wider block mb-1">PLACEMENT LAYOUT COORDINATE</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(["bottom-right", "bottom-left", "top-right", "center"] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setWatermarkPosition(pos)}
                            className={`px-1.5 py-1 text-[8px] font-mono border uppercase tracking-wider transition-colors ${
                              watermarkPosition === pos 
                                ? "border-black bg-black text-[#f7f4ed]" 
                                : "border-neutral-200 hover:border-black bg-[#faf9f6]"
                            }`}
                          >
                            {pos.replace("-", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scale */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[8px] text-[#8b8780] uppercase tracking-wider block">WATERMARK SCALE FACTOR</span>
                        <span className="font-mono text-[8px] text-[#5f5e59]">{Math.round(watermarkScale * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="1.8" 
                        step="0.1"
                        value={watermarkScale}
                        onChange={(e) => setWatermarkScale(parseFloat(e.target.value))}
                        className="w-full h-1 bg-neutral-200 accent-black cursor-pointer appearance-none rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cabinet Base Actions */}
            <div className="pt-4 border-t border-[#e5e1d8] space-y-2 bg-[#f7f4ed]">
              <button
                type="button"
                onClick={handleApplyEdits}
                className="w-full py-2.5 bg-black hover:bg-neutral-900 border border-black text-white font-sans text-xs tracking-widest uppercase font-semibold text-center hover:opacity-90 transition-opacity"
              >
                COMPILE & WRITE TO STREAM
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-transparent hover:bg-neutral-100 border border-[#e5e1d8] text-[#5f5e59] font-sans text-xs tracking-widest uppercase text-center transition-all"
              >
                DISPOSE EDITS
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
