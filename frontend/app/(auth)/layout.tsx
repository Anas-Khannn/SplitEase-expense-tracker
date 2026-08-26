"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/gsapConfig";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const AuthScene3D = dynamic(() => import("@/components/auth/AuthScene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-br from-scene-bg-900 via-scene-bg-800 to-scene-bg-700" />
  ),
});

const headlineWords = ["Split", "expenses", "effortlessly", "with", "friends"];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!headlineRef.current) return;
      const words = headlineRef.current.querySelectorAll(".word");
      gsap.set(words, { opacity: 0, y: 18 });
      gsap.to(words, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: "power2.out",
        delay: 0.5,
      });
    },
    { scope: headlineRef, dependencies: [] }
  );

  return (
    <div className="relative flex min-h-dvh w-full overflow-hidden">
      {/* Left: Auth scene (hidden < md) */}
      <div className="hidden md:flex md:w-[55%] lg:w-[58%] relative">
        <AuthScene3D />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center pointer-events-none">
          <h1
            ref={headlineRef}
            className="text-h1 font-bold text-scene-text leading-tight mb-3"
          >
            {headlineWords.map((w, i) => (
              <span key={i} className="word inline-block mr-[0.35em]">
                {w}
              </span>
            ))}
          </h1>
        </div>
      </div>

      {/* Right: Auth card area */}
      <div className="flex flex-1 items-center justify-center px-6 py-10 md:w-[45%] lg:w-[42%] bg-base">
        <div className="w-full max-w-md">
          <ProtectedRoute>{children}</ProtectedRoute>
        </div>
      </div>
    </div>
  );
}
