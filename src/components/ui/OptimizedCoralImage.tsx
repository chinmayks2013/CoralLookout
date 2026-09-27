"use client";

import Image from "next/image";

function isOptimizableUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

interface OptimizedCoralImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Responsive sizes hint for next/image (required with fill). */
  sizes?: string;
  priority?: boolean;
}

/**
 * Routes remote coral/gallery URLs through Vercel Image Optimization.
 * Keeps raw <img> for data:/blob: previews (scanner, discussion drafts).
 */
export function OptimizedCoralImage({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 50vw, 160px",
  priority = false,
}: OptimizedCoralImageProps) {
  if (!isOptimizableUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`h-full w-full ${className ?? ""}`} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      quality={75}
    />
  );
}
