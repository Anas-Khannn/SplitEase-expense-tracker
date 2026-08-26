"use client";

import { useRef, useEffect } from "react";
import type { default as TubesCursorFactory } from "threejs-components/build/cursors/tubes1.min.js";

const AURORA_TUBE_COLORS = ["#3B5BFF", "#8B3FE0", "#E93FE0"];
const AURORA_LIGHT_COLORS: [string, string, string, string] = [
  "#3B5BFF",
  "#8B3FE0",
  "#E93FE0",
  "#6C5CE0",
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isWebGLAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function TubesCursorBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (window.innerWidth < 768 || prefersReducedMotion() || !isWebGLAvailable()) {
      return;
    }

    let app: Awaited<ReturnType<typeof TubesCursorFactory>> | null = null;
    let cancelled = false;

    import("threejs-components/build/cursors/tubes1.min.js").then((module) => {
      if (cancelled) return;
      const TubesCursor = module.default;
      app = TubesCursor(canvas, {
        tubes: {
          count: 12,
          colors: AURORA_TUBE_COLORS,
          minRadius: 0.008,
          maxRadius: 0.035,
          lights: {
            intensity: 160,
            colors: AURORA_LIGHT_COLORS,
          },
        },
        bloom: {
          threshold: 0,
          strength: 0.9,
          radius: 0.5,
        },
      });
    });

    return () => {
      cancelled = true;
      app?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
