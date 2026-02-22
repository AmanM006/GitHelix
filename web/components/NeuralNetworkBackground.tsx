"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Signal {
  start: Particle;
  end: Particle;
  progress: number;
  speed: number;
}

export default function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let signals: Signal[] = [];

    // --- Configuration ---
    const particleCount = 80; // Number of nodes
    const connectionDistance = 150; // Max distance to connect
    const signalSpawnRate = 0.05; // Chance to spawn a signal per frame
    const nodeColor = "rgba(0, 0, 0, 0.7)"; // Black nodes
    const lineColor = "rgba(0, 0, 0, 0.08)"; // Faint black lines
    const signalColor = "#000000"; // Solid black signals

    const init = () => {
      resizeCanvas();
      createParticles();
      render();
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5, // Slow movement speed
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Update and draw particles & lines
      for (let i = 0; i < particles.length; i++) {
        let p1 = particles[i];

        // Move particle
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Bounce off edges
        if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

        // Draw node point
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();

        // Connect to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          let p2 = particles[j];
          let dx = p1.x - p2.x;
          let dy = p1.y - p2.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Randomly spawn a signal between these two connected nodes
            if (Math.random() < signalSpawnRate / particles.length) {
              signals.push({
                start: p1,
                end: p2,
                progress: 0,
                // Random speed between 0.005 and 0.02
                speed: Math.random() * 0.015 + 0.005, 
              });
            }
          }
        }
      }

      // 2. Update and draw signals (inputs)
      for (let i = signals.length - 1; i >= 0; i--) {
        let sig = signals[i];
        sig.progress += sig.speed;

        if (sig.progress >= 1) {
          signals.splice(i, 1); // Remove finished signals
          continue;
        }

        // Calculate current signal position
        const currX = sig.start.x + (sig.end.x - sig.start.x) * sig.progress;
        const currY = sig.start.y + (sig.end.y - sig.start.y) * sig.progress;

        // Draw signal dot
        ctx.beginPath();
        ctx.arc(currX, currY, 3, 0, Math.PI * 2);
        ctx.fillStyle = signalColor;
        ctx.fill();
      }
    };

    const render = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(render);
    };

    init();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0, // Behind everything
        pointerEvents: "none", // Don't block clicks
        opacity: 0.6, // Blends nicely with the beige background
      }}
    />
  );
}