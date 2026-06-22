import React from "react";

interface AyuVibeeLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light" | "gold";
  className?: string;
}

export default function AyuVibeeLogo({ size = "md", theme = "dark", className = "" }: AyuVibeeLogoProps) {
  let heightCls = "h-14";
  if (size === "sm") {
    heightCls = "h-8 md:h-10";
  } else if (size === "md") {
    heightCls = "h-14";
  } else if (size === "lg") {
    heightCls = "h-24";
  } else if (size === "xl") {
    heightCls = "h-36";
  }

  // mix-blend-multiply cleanly drops white background of the image
  // rendering transparently over our off-white / light-cream background layers.
  const filterCls = theme === "light" ? "invert opacity-90 contrast-125" : "mix-blend-multiply";

  return (
    <div className={`flex flex-col select-none justify-start items-start ${className}`}>
      <img
        src="/src/assets/images/ayu_vibee_logo_1782050785435.jpg"
        alt="ayu.vibee typography logo"
        className={`${heightCls} object-contain transition-all duration-300 ${filterCls}`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
