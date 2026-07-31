"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Wrapper cho next/image với fallback khi ảnh lỗi.
 * - Hỗ trợ `sizes` để tối ưu responsive.
 * - Hỗ trợ `priority` cho LCP.
 */
export function SafeImage({
  fallbackClassName,
  sizes = "100vw",
  ...props
}: ImageProps & { fallbackClassName?: string; sizes?: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className={
          fallbackClassName ??
          "w-full h-full flex items-center justify-center text-muted text-[10px] bg-secondary/30"
        }
      >
        —
      </div>
    );
  }

  return <Image {...props} onError={() => setBroken(true)} sizes={sizes} />;
}