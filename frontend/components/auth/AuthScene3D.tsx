"use client";

import dynamic from "next/dynamic";
import { motion as m, type Variants } from "framer-motion";

const TubesCursorBackground = dynamic(
  () => import("./TubesCursorBackground"),
  { ssr: false }
);

const ribbonVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut", delay: 0.3 },
  },
};

const svgWave = (
  <svg
    className="absolute bottom-0 left-0 w-full h-auto"
    viewBox="0 0 440 120"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3B5BFF" stopOpacity="0.12" />
        <stop offset="50%" stopColor="#8B3FE0" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#E93FE0" stopOpacity="0.12" />
      </linearGradient>
    </defs>
    <path
      d="M0,80 C110,40 220,100 330,60 C390,45 430,70 440,60 L440,120 L0,120 Z"
      fill="url(#waveGrad)"
    />
    <path
      d="M0,95 C80,75 200,110 320,80 C380,68 420,90 440,80 L440,120 L0,120 Z"
      fill="url(#waveGrad)"
      opacity="0.5"
    />
  </svg>
);

export default function AuthScene3D() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-scene-bg-900 via-scene-bg-800 to-scene-bg-700" />

      <TubesCursorBackground />

      <m.div
        className="absolute bottom-0 left-0 w-full z-5"
        variants={ribbonVariants}
        initial="initial"
        animate="animate"
      >
        {svgWave}
      </m.div>
    </div>
  );
}
