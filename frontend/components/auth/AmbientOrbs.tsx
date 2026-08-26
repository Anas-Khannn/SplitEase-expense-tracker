"use client";

import { motion } from "framer-motion";

const orbs = [
  {
    className: "-top-16 -left-16 w-72 h-72 bg-primary-500",
    y: [0, -18, 0],
    opacity: [0.18, 0.32, 0.18],
    duration: 7,
    delay: 0,
  },
  {
    className: "top-1/3 -right-20 w-80 h-80 bg-[#8B3FE0]",
    y: [0, 20, 0],
    opacity: [0.12, 0.24, 0.12],
    duration: 9,
    delay: 1.2,
  },
  {
    className: "-bottom-24 left-1/4 w-64 h-64 bg-[#3B5BFF]",
    y: [0, -14, 0],
    opacity: [0.1, 0.2, 0.1],
    duration: 8,
    delay: 0.6,
  },
];

export default function AmbientOrbs() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-3xl ${orb.className}`}
          animate={{ y: orb.y, opacity: orb.opacity }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
