import React from "react";

export default function BottomRightWaves() {
  return (
    <div style={{
      position: "fixed", 
      bottom: 0, 
      right: 0,
      width: "38%", 
      height: "38%",
      minWidth: "300px",
      minHeight: "180px",
      zIndex: -1, 
      pointerEvents: "none",
      transform: "scaleX(-1)" // Mirrors the graphic to fit perfectly in the bottom-right corner
    }}>
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMinYMax meet"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="lp-blue-grad-game" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#1E50E8" />
            <stop offset="100%" stopColor="#0B2880" />
          </linearGradient>
          <linearGradient id="lp-red-grad-game" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#E83030" />
            <stop offset="100%" stopColor="#991010" />
          </linearGradient>
        </defs>
        
        {/* Big blue wave */}
        <path d="M 0 240 L 0 55 Q 210 240 400 240 Z" fill="url(#lp-blue-grad-game)" />
        
        {/* Smaller red wave */}
        <path d="M 0 240 L 0 140 Q 115 240 210 240 Z" fill="url(#lp-red-grad-game)" />
        
        {/* White dot grid */}
        {[0,1,2,3,4].flatMap(row =>
          [0,1,2,3].map(col => (
            <circle
              key={`d-${row}-${col}`}
              cx={18 + col * 20}
              cy={145 + row * 18}
              r="2.8"
              fill="rgba(255,255,255,0.35)"
            />
          ))
        )}
      </svg>
    </div>
  );
}
