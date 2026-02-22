// web/components/TextReveal.tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  text: string;
  className?: string;
  delay?: number;
}

export default function TextReveal({ text, className = "", delay = 0 }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  // Split into words to keep DOM size manageable while still looking smooth
  const words = text.split(" ");

  return (
    <div ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap", gap: "0.3em" }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            opacity: isVisible ? 1 : 0,
            filter: isVisible ? "blur(0px)" : "blur(10px)",
            transform: isVisible ? "translateY(0)" : "translateY(10px)",
            transition: `all 0.4s cubic-bezier(0.2, 0.65, 0.3, 0.9)`,
            transitionDelay: `${delay + i * 0.05}s`, // The delay creates the wave effect
            willChange: "opacity, filter, transform",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}