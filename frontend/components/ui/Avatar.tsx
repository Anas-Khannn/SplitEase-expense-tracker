"use client";

/* eslint-disable @next/next/no-img-element -- Avatar handles arbitrary user URLs with error fallback */

import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size" | "src"> {
  src?: string | null;
  alt: string;
  name?: string;
  size?: AvatarSize;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-caption",
  md: "h-10 w-10 text-body-sm",
  lg: "h-12 w-12 text-body",
  xl: "h-16 w-16 text-h3",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ src, alt, name, size = "md", className, ...props }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-semibold text-primary-600",
        sizeStyles[size],
        className
      )}
      role="img"
      aria-label={alt}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          {...props}
        />
      ) : (
        <span aria-hidden="true">{name ? getInitials(name) : "?"}</span>
      )}
    </div>
  );
}

export { Avatar, type AvatarProps, type AvatarSize };
