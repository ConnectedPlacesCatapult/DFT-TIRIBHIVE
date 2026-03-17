"use client";

import Image from "next/image";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import type { ThemeKey } from "@/lib/hive/themes";
import { useEffect, useState } from "react";

const HERO_IMAGES = [
  { src: "/hero/hero-1-sheffield.jpg", caption: "Sheffield Grey to Green · ID_40" },
  { src: "/hero/hero-2-dawlish.jpg", caption: "Network Rail Dawlish Sea Wall · ID_46" },
  { src: "/hero/hero-3-rockfall.jpg", caption: "Austrian Federal Railways · ID_06" },
  { src: "/hero/hero-4-panama.jpg", caption: "Panama Canal Authority · ID_37" },
  { src: "/hero/hero-5-heathrow.jpg", caption: "Heathrow Airport Balancing Ponds · ID_32" },
];

const CYCLE_MS = 6000;
const CROSSFADE_MS = 2000;
const FADE_START = (CYCLE_MS - CROSSFADE_MS) / CYCLE_MS;

export function HeroImageCycle() {
  const { themeKey, heroTextTreatment, heroTextTreatmentExtent } = useChatContext();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  const isDark = themeKey === "dark";
  const light = (a: number) => `rgba(247,245,240,${a})`;
  const dark = (a: number) => `rgba(13,17,23,${a})`;
  const L = isDark ? dark : light;

  // Steep gradient: extent 8–120 → fade ends at ~65%–35% (higher extent = steeper, image clears sooner)
  const fadeEndPct = 65 - ((heroTextTreatmentExtent - 8) / 112) * 30;
  const gradientOverlay =
    heroTextTreatment === "gradient"
      ? `linear-gradient(to right, ${L(0.95)} 0%, ${L(0.7)} ${fadeEndPct * 0.5}%, ${L(0.1)} ${fadeEndPct - 5}%, ${L(0)} ${fadeEndPct}%, ${L(0)} 100%)`
      : heroTextTreatment === "scrim" || heroTextTreatment === "backplate"
        ? `linear-gradient(to right, ${L(0.75)} 0%, ${L(0.5)} 35%, ${L(0.2)} 65%, ${L(0)} 100%)`
        : isDark
          ? "linear-gradient(to right, rgba(13,17,23,0.95) 0%, rgba(13,17,23,0.7) 40%, rgba(13,17,23,0.2) 70%, rgba(13,17,23,0) 100%)"
          : "linear-gradient(to right, rgba(247,245,240,0.95) 0%, rgba(247,245,240,0.7) 40%, rgba(247,245,240,0.2) 70%, rgba(247,245,240,0) 100%)";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const start = performance.now();
    const id = setInterval(() => {
      const elapsedSec = (performance.now() - start) / 1000;
      const cycleSec = CYCLE_MS / 1000;
      const p = (elapsedSec % cycleSec) / cycleSec;
      setProgress(p);
      setIndex(Math.floor(elapsedSec / cycleSec) % HERO_IMAGES.length);
    }, 80);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const current = HERO_IMAGES[index];
  const nextIndex = (index + 1) % HERO_IMAGES.length;
  const next = HERO_IMAGES[nextIndex];

  const currentOpacity = progress < FADE_START ? 1 : Math.max(0, 1 - (progress - FADE_START) / (1 - FADE_START));
  const nextOpacity = progress < FADE_START ? 0 : Math.min(1, (progress - FADE_START) / (1 - FADE_START));

  const imageStyle = {
    objectFit: "cover" as const,
    objectPosition: "right center" as const,
    filter: "grayscale(60%) brightness(0.7)",
  };
  const captionStyle = {
    position: "absolute" as const,
    right: 24,
    bottom: 16,
    fontSize: 11,
    opacity: 0.4,
    color: isDark ? "#e2e8f0" : "#1c1917",
  };

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
      {/* Current image */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: loaded[index] === true ? currentOpacity : 0,
          transition: reducedMotion ? "none" : "opacity 2s ease-in-out",
        }}
      >
        {loaded[index] !== false && (
          <Image
            src={current.src}
            alt=""
            fill
            sizes="100vw"
            style={imageStyle}
            onLoad={() => setLoaded((l) => ({ ...l, [index]: true }))}
            onError={() => setLoaded((l) => ({ ...l, [index]: false }))}
          />
        )}
        <div style={{ position: "absolute", inset: 0, background: gradientOverlay }} />
        <div style={captionStyle}>{current.caption}</div>
      </div>

      {/* Next image (crossfade) */}
      {!reducedMotion && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: loaded[nextIndex] === true ? nextOpacity : 0,
            transition: "opacity 2s ease-in-out",
          }}
        >
          {loaded[nextIndex] !== false && (
            <Image
              key={nextIndex}
              src={next.src}
              alt=""
              fill
              sizes="100vw"
              style={imageStyle}
              onLoad={() => setLoaded((l) => ({ ...l, [nextIndex]: true }))}
              onError={() => setLoaded((l) => ({ ...l, [nextIndex]: false }))}
            />
          )}
          <div style={{ position: "absolute", inset: 0, background: gradientOverlay }} />
          <div style={captionStyle}>{next.caption}</div>
        </div>
      )}
    </div>
  );
}
