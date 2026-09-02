"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import {
  Avatar as ShadcnAvatar,
  AvatarImage,
  AvatarFallback,
} from "./primitives/avatar";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size" | "src"> {
  src?: string | null;
  alt: string;
  name?: string;
  size?: AvatarSize;
}

const radixSizeMap: Record<AvatarSize, "sm" | "default" | "lg"> = {
  sm: "sm",
  md: "default",
  lg: "lg",
  xl: "lg",
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
  const radixSize = radixSizeMap[size];

  return (
    <ShadcnAvatar
      size={radixSize}
      className={cn(
        size === "xl" && "size-16 text-2xl",
        size === "lg" && "size-12 text-lg",
        size === "md" && "size-10 text-sm",
        size === "sm" && "size-8 text-xs",
        className
      )}
    >
      {showImage ? (
        <AvatarImage
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          {...(props as object)}
        />
      ) : null}
      <AvatarFallback className="bg-muted text-muted-foreground">
        {name ? getInitials(name) : "?"}
      </AvatarFallback>
    </ShadcnAvatar>
  );
}

export { Avatar, type AvatarProps, type AvatarSize };
