import React from "react";

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

const block = (e: React.SyntheticEvent) => e.preventDefault();

export default function ProtectedImage({ wrapperClassName = "", className = "", style, ...props }: ProtectedImageProps) {
  return (
    <div className={`relative select-none ${wrapperClassName}`} style={{ WebkitUserSelect: "none" }}>
      <img
        {...props}
        className={className}
        style={style}
        draggable={false}
        onContextMenu={block}
        onDragStart={block}
      />
      {/* Transparent shield — intercepts right-click/drag-save attempts */}
      <div
        className="absolute inset-0 z-10"
        onContextMenu={block}
        onDragStart={block}
        style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
      />
    </div>
  );
}
