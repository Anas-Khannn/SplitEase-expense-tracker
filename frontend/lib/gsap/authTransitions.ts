import { gsap } from "./gsapConfig";

export function transitionToLogin(fromElement: HTMLElement, toElement: HTMLElement) {
  const tl = gsap.timeline();
  tl.to(fromElement, { opacity: 0, x: -30, duration: 0.4, ease: "power2.inOut" });
  tl.fromTo(toElement, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.inOut" });
  return tl;
}

export function transitionToSignup(fromElement: HTMLElement, toElement: HTMLElement) {
  const tl = gsap.timeline();
  tl.to(fromElement, { opacity: 0, x: 30, duration: 0.4, ease: "power2.inOut" });
  tl.fromTo(toElement, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.inOut" });
  return tl;
}

export function transitionToForgotPassword(fromElement: HTMLElement, toElement: HTMLElement) {
  const tl = gsap.timeline();
  tl.to(fromElement, { opacity: 0, y: -20, duration: 0.4, ease: "power2.inOut" });
  tl.fromTo(toElement, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.inOut" });
  return tl;
}

export function transitionToResetPassword(fromElement: HTMLElement, toElement: HTMLElement) {
  const tl = gsap.timeline();
  tl.to(fromElement, { opacity: 0, y: -20, duration: 0.4, ease: "power2.inOut" });
  tl.fromTo(toElement, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.inOut" });
  return tl;
}
