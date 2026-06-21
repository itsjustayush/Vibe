import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface CarouselProps {
  images: string[];
  isNaturalColor?: boolean;
  className?: string;
  onSelectImage?: (index: number) => void;
  currentIndex?: number;
}

export default function Carousel({
  images,
  isNaturalColor = true,
  className = "",
  onSelectImage,
  currentIndex
}: CarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = currentIndex !== undefined ? currentIndex : internalIndex;
  const touchStartX = useRef<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[16/10] bg-[#faf9f6] flex items-center justify-center border border-[#e5e1d8]">
        <span className="font-mono text-[10px] tracking-widest text-[#8b8780] uppercase">No Captured Imagery Available</span>
      </div>
    );
  }

  const handleIndexChange = (newIndex: number) => {
    const wrappedIndex = (newIndex + images.length) % images.length;
    if (onSelectImage) {
      onSelectImage(wrappedIndex);
    } else {
      setInternalIndex(wrappedIndex);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleIndexChange(activeIndex + 1);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleIndexChange(activeIndex - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Minimum distance for a swipe trigger (50px)
    if (diffX > 50) {
      handleNext();
    } else if (diffX < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <div 
      className={`relative overflow-hidden group/carousel ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full bg-[#1a1a1a] flex items-center justify-center">
        {/* Animated Slide Frame */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={`${activeIndex}-${images[activeIndex]}`}
            src={images[activeIndex]}
            alt={`Masterpiece view ${activeIndex + 1}`}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isNaturalColor 
                ? "grayscale-0 contrast-100" 
                : "grayscale contrast-115 group-hover/carousel:grayscale-0"
            }`}
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>

        {/* Gradient Edge Overlays */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />

        {/* Interactive Desktop Arrows */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex justify-between items-center px-4 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300 z-20">
            <button
              onClick={handlePrev}
              type="button"
              className="w-9 h-9 bg-black/80 hover:bg-black text-white hover:scale-105 flex items-center justify-center transition-all shadow-xl cursor-pointer border border-[#faf9f6]/30 rounded-none"
              title="Previous slide"
              aria-label="Previous slide"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="w-9 h-9 bg-black/80 hover:bg-black text-white hover:scale-105 flex items-center justify-center transition-all shadow-xl cursor-pointer border border-[#faf9f6]/30 rounded-none"
              title="Next slide"
              aria-label="Next slide"
            >
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Dynamic Badge/Count */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-sm text-[#f7f4ed] font-mono text-[8px] tracking-[0.25em] py-1.5 px-3 z-20 uppercase leading-none border border-neutral-700">
            {activeIndex + 1} / {images.length} PREVIEWS
          </div>
        )}

        {/* Subtle Horizontal Progression Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1.5 z-20">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIndexChange(idx);
                }}
                className={`w-2 h-1.5 transition-all duration-300 cursor-pointer ${
                  activeIndex === idx 
                    ? "bg-white w-4" 
                    : "bg-white/40 hover:bg-white/70"
                }`}
                title={`Advance to frame ${idx + 1}`}
                aria-label={`Advance to frame ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
