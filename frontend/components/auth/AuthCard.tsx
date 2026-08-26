"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/gsapConfig";
import { Card } from "@/components/ui";

interface AuthCardProps {
  children: ReactNode;
  screenKey: string;
  className?: string;
}

export default function AuthCard({
  children,
  screenKey,
  className,
}: AuthCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const prevScreenRef = useRef(screenKey);

  useGSAP(
    () => {
      if (!cardRef.current) return;
      if (prevScreenRef.current !== screenKey) {
        const tl = gsap.timeline();
        tl.to(cardRef.current, {
          rotateY: -8,
          opacity: 0,
          duration: 0.225,
          ease: "power2.in",
        });
        tl.fromTo(
          cardRef.current,
          { rotateY: 8, opacity: 0 },
          {
            rotateY: 0,
            opacity: 1,
            duration: 0.225,
            ease: "power2.out",
          }
        );
        prevScreenRef.current = screenKey;
      }
    },
    { dependencies: [screenKey], scope: cardRef }
  );

  return (
    <div ref={cardRef} style={{ perspective: 800 }}>
      <Card variant="elevated" className={className}>
        {children}
      </Card>
    </div>
  );
}
