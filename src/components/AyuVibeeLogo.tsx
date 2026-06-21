import React from "react";

interface AyuVibeeLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light" | "gold";
  className?: string;
}

export default function AyuVibeeLogo({ size = "md", theme = "dark", className = "" }: AyuVibeeLogoProps) {
  // Dimensions and scaling factor based on size
  let scale = 1.0;
  let textCls = "text-xl";
  let letterSpacingCls = "tracking-[0.25em]";
  let subCls = "text-[7px]";
  let containerPadding = "gap-1";

  if (size === "sm") {
    scale = 0.6;
    textCls = "text-sm";
    letterSpacingCls = "tracking-[0.2em]";
    subCls = "text-[5.5px]";
    containerPadding = "gap-0.5";
  } else if (size === "md") {
    scale = 1.0;
    textCls = "text-xl";
    letterSpacingCls = "tracking-[0.25em]";
    subCls = "text-[8px]";
    containerPadding = "gap-1";
  } else if (size === "lg") {
    scale = 1.6;
    textCls = "text-3xl";
    letterSpacingCls = "tracking-[0.3em]";
    subCls = "text-[11px]";
    containerPadding = "gap-2";
  } else if (size === "xl") {
    scale = 2.4;
    textCls = "text-5xl";
    letterSpacingCls = "tracking-[0.35em]";
    subCls = "text-[15px]";
    containerPadding = "gap-3";
  }

  // Brand color configurations
  const avColor = 
    theme === "dark" 
      ? "text-black" 
      : theme === "light" 
      ? "text-[#f7f4ed]" 
      : "text-[#e5dfce]"; // gold/cream theme

  const subColor = 
    theme === "dark" 
      ? "text-black/80" 
      : theme === "light" 
      ? "text-[#f7f4ed]/90" 
      : "text-[#eab308]";

  const apertureGold = "#eab308";

  return (
    <div className={`flex flex-col items-center select-none ${containerPadding} ${className}`}>
      {/* Upper core: "av" combined with the golden shutter blade iris */}
      <div className="relative flex items-center justify-center">
        {/* Main combined lettering */}
        <span className={`font-serif italic font-bold tracking-tight lowercase ${avColor} ${textCls} relative`} style={{ marginRight: `${16 * scale}px` }}>
          av
          {/* Shutter Blade Wheel adjacent to "v" */}
          <span 
            className="absolute"
            style={{ 
              right: `-${24 * scale}px`, 
              top: `-${2 * scale}px`,
              width: `${18 * scale}px`,
              height: `${18 * scale}px`
            }}
          >
            <svg 
              viewBox="0 0 100 100" 
              fill="none" 
              className="w-full h-full transform animate-[spin_40s_linear_infinite]"
            >
              {/* Outer Golden Circle Ring */}
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                stroke={apertureGold} 
                strokeWidth="7" 
                fill="none"
              />
              
              {/* Converging Shutter Blades */}
              <path d="M 50 10 L 80 40 L 71 52 L 40 28 Z" fill={apertureGold} opacity="0.95" />
              <path d="M 90 50 L 60 80 L 48 71 L 72 40 Z" fill={apertureGold} opacity="0.95" />
              <path d="M 50 90 L 20 60 L 29 48 L 60 72 Z" fill={apertureGold} opacity="0.95" />
              <path d="M 10 50 L 40 20 L 52 29 L 28 60 Z" fill={apertureGold} opacity="0.95" />
              
              {/* Additional connectors to establish accurate hexagonal camera aperture look */}
              <path d="M 21 21 L 50 15 L 61 35 L 32 41 Z" fill={apertureGold} opacity="0.9" />
              <path d="M 79 79 L 50 85 L 39 65 L 68 59 Z" fill={apertureGold} opacity="0.9" />
              
              {/* Core central hex void */}
              <polygon 
                points="50,38 60,44 60,56 50,62 40,56 40,44" 
                fill={theme === "light" ? "#f7f4ed" : theme === "dark" ? "#f7f4ed" : "#1a1a17"} 
                className={theme === "light" ? "fill-[#f7f4ed]" : theme === "dark" ? "fill-[#f7f4ed]" : "fill-[#1a1a17]"}
              />
            </svg>
          </span>
        </span>
      </div>

      {/* Spaced lettering: "PHOTOGRAPHY" underneath */}
      <span 
        className={`font-sans font-bold uppercase leading-none opacity-90 tracking-[0.25em] ${subColor} ${subCls}`}
        style={{ letterSpacing: `${2.8 * scale}px` }}
      >
        PHOTOGRAPHY
      </span>
    </div>
  );
}
