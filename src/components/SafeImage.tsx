
"use client";

import { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends ImageProps {
  fallbackClassName?: string;
  sizes?: string;
  fallbackSrc?: string;
  enableEnkaFallback?: boolean;
}

export function SafeImage({
  fallbackClassName,
  sizes = "100vw",
  fallbackSrc,
  enableEnkaFallback = true,
  alt,
  ...props
}: SafeImageProps) {
  const [src, setSrc] = useState(props.src);
  const [broken, setBroken] = useState(false);
  const [attemptedFallback, setAttemptedFallback] = useState(false);

  useEffect(() => {
    setSrc(props.src);
    setBroken(false);
    setAttemptedFallback(false);
  }, [props.src]);

  const handleError = () => {
    if (fallbackSrc && !attemptedFallback && src !== fallbackSrc) {
      setSrc(fallbackSrc);
      setAttemptedFallback(true);
      return;
    }

    if (enableEnkaFallback && typeof src === "string") {
      const r2Domain = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";
      if (r2Domain && src.startsWith(r2Domain) && !attemptedFallback) {
        const fileName = src.split("/").pop();
        if (fileName) {
          const enkaUrl = `https://enka.network/ui/${fileName}`;
          setSrc(enkaUrl);
          setAttemptedFallback(true);
          return;
        }
      }
    }

    setBroken(true);
  };

  if (broken) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={
          fallbackClassName ??
          "w-full h-full flex items-center justify-center text-muted text-[10px] bg-secondary/30"
        }
      >
        —
      </div>
    );
  }

  return <Image {...props} src={src} alt={alt} onError={handleError} sizes={sizes} />;
}
