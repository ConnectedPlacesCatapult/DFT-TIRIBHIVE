"use client";

import { useChatContext } from "@/components/handbook/shared/ChatContext";
import type { ThemeKey } from "@/lib/hive/themes";
import { useEffect, useRef, useState } from "react";

function getParticleHexColor(themeKey: ThemeKey): string {
  switch (themeKey) {
    case "dark":
      return "#ffffff";
    case "dft":
      return "#003a70";
    default:
      return "#1e3a5f";
  }
}

/** Canvas-based particles: climate-themed wave by default, strong cursor reaction on hover. */
function ParticlesEffect({ themeKey }: { themeKey: ThemeKey }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });
  const timeRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particleCount = 200;
    const speed = 0.08;
    const particleSpread = 10;
    const particleBaseSize = 100;
    const sizeRandomness = 1;
    const hoverStrength = 0.032;
    const waveStrength = 0.012;
    const color = getParticleHexColor(themeKey);

    type Particle = { x: number; y: number; z: number; vx: number; vy: number; size: number; phase: number };
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random(),
        vx: (Math.random() - 0.5) * 0.0015,
        vy: (Math.random() - 0.5) * 0.0015,
        size: (particleBaseSize / 100) * (0.5 + Math.random() * sizeRandomness) * 2,
        phase: (i / particleCount) * Math.PI * 2,
      });
    }

    let animationId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hoverActive = mouseRef.current.active;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * speed * 60;
        p.y += p.vy * speed * 60;

        if (hoverActive) {
          const dx = mx - (p.x * 0.5 + 0.5);
          const dy = my - (p.y * 0.5 + 0.5);
          p.x += dx * hoverStrength;
          p.y += dy * hoverStrength;
        } else {
          const waveX = Math.sin(t * 0.6 + p.phase) * waveStrength;
          const waveY = Math.cos(t * 0.4 + p.phase * 1.3) * waveStrength;
          p.x += waveX;
          p.y += waveY;
        }

        if (p.x < -1.2) p.x += 2.4;
        if (p.x > 1.2) p.x -= 2.4;
        if (p.y < -1.2) p.y += 2.4;
        if (p.y > 1.2) p.y -= 2.4;

        const sx = (p.x * 0.5 + 0.5) * w;
        const sy = (p.y * 0.5 + 0.5) * h;
        const size = (p.size * particleSpread) / 10;
        const alpha = 0.12 * (0.3 + 0.7 * p.z);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animationId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      mouseRef.current.active = inside;
      if (inside) {
        mouseRef.current.x = (e.clientX - rect.left) / rect.width;
        mouseRef.current.y = (e.clientY - rect.top) / rect.height;
      }
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [mounted, themeKey]);

  if (!mounted || typeof window === "undefined") return null;

  try {
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </div>
    );
  } catch {
    return null;
  }
}

function AuroraEffect({ themeKey }: { themeKey: ThemeKey }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof window === "undefined") return null;

  try {
    const isDark = themeKey === "dark";
    const color1 = isDark ? "#0f766e" : "#0d9488";
    const color2 = isDark ? "#7e22ce" : "#2563eb";
    const color3 = isDark ? "#4c1d95" : "#1d4ed8";

    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-50%",
            opacity: 0.3,
            background: `radial-gradient(ellipse 80% 50% at 20% 40%, ${color1}, transparent),
              radial-gradient(ellipse 60% 80% at 80% 60%, ${color2}, transparent),
              radial-gradient(ellipse 70% 60% at 50% 80%, ${color3}, transparent)`,
            filter: "blur(40px)",
            animation: "hive-aurora-shift 15s ease-in-out infinite alternate",
          }}
        />
        <style>{`
          @keyframes hive-aurora-shift {
            0% { transform: scale(1) translate(0, 0); opacity: 0.3; }
            100% { transform: scale(1.1) translate(-3%, -2%); opacity: 0.35; }
          }
        `}</style>
      </div>
    );
  } catch {
    return null;
  }
}

export function BackgroundEffect() {
  const { backgroundEffect, themeKey } = useChatContext();

  if (backgroundEffect === "none") return null;

  try {
    return (
      <>
        {backgroundEffect === "particles" && <ParticlesEffect themeKey={themeKey} />}
        {backgroundEffect === "aurora" && <AuroraEffect themeKey={themeKey} />}
      </>
    );
  } catch {
    return null;
  }
}
