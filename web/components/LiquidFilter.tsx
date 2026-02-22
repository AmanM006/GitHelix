"use client";

export default function LiquidFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }}>
      <defs>
        <filter id="liquidGlass">
          {/* Heavy Turbulence from Saglix Snippet */}
          <feTurbulence 
            type="turbulence" 
            baseFrequency="0.001" 
            numOctaves="10" 
            result="turbulence" 
          />
          
          {/* Massive Displacement Scale (100) */}
          <feDisplacementMap 
            in2="turbulence" 
            in="SourceGraphic" 
            scale="100" 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </defs>
    </svg>
  );
}