import { gsap } from "./gsapConfig";

export function createAuthSceneTimeline() {
  return gsap.timeline({ paused: true });
}

export function createAuthTransitionTimeline() {
  return gsap.timeline({ paused: true });
}
