"use client";

import { useCallback } from "react";
import { useAnimation } from "framer-motion";

export function useShake() {
  const shakeControls = useAnimation();

  const shake = useCallback(() => {
    shakeControls.start({
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
  }, [shakeControls]);

  return { shakeControls, shake };
}
