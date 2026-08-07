"use client";

import { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "src"> {
  fallbackClassName?: string;
  sizes?: string;
  /**
   * `src` được khai báo lại (nullable) so với ImageProps gốc — cho phép
   * gọi nơi khác truyền thẳng `c.iconUrl || c.splashUrl` (kiểu
   * `string | null`) mà KHÔNG phải ép về `''` khi cả 2 đều rỗng. Component
   * này tự render trạng thái rỗng có chủ đích khi không có src nào, thay vì
   * next/image nhận `src=""` — next/image không hợp lệ với chuỗi rỗng, và
   * `<img src="">` ở mức trình duyệt có thể tự fetch lại chính URL trang
   * hiện tại làm ảnh (quirk cũ của HTML), gây request thừa vô nghĩa.
   */
  src?: ImageProps["src"] | null;
  /**
   * Danh sách URL dự phòng, thử LẦN LƯỢT theo thứ tự mỗi khi `src` hiện tại
   * (hoặc fallback trước đó) tải lỗi. Ví dụ:
   * `fallbackSrcs={[c.iconUrl, c.splashUrlOriginal, c.iconUrlOriginal]}`.
   *
   * ĐÃ BỎ cơ chế cũ "tự đoán URL enka.network từ tên file trên R2" — cách
   * đó sai về bản chất: object trên R2 được scripts/mirror-images-to-r2.ts
   * đặt tên GENERIC theo field ("icon.png", "splash.png"...), không giữ
   * tên file gốc trên Enka (dạng "UI_AvatarIcon_Kazuha.png"), nên đoán
   * ngược từ tên file luôn ra URL enka.network không tồn tại — 404 gần như
   * 100% số lần, và không có gì báo lỗi ra ngoài. Muốn có URL gốc thật để
   * dự phòng, phải truyền thẳng vào `fallbackSrcs` (thường là cột
   * `*UrlOriginal` tương ứng trong DB — xem prisma/schema.prisma).
   */
  fallbackSrcs?: Array<string | null | undefined>;
  /** @deprecated Dùng `fallbackSrcs`. Vẫn hỗ trợ để tương thích ngược. */
  fallbackSrc?: string | null;
}

export function SafeImage({
  fallbackClassName,
  sizes = "100vw",
  fallbackSrc,
  fallbackSrcs,
  alt,
  src: srcProp,
  ...props
}: SafeImageProps) {
  const candidates = [
    ...(typeof srcProp === "string" ? [srcProp] : []),
    ...(fallbackSrc ? [fallbackSrc] : []),
    ...(fallbackSrcs ?? []),
  ].filter((u): u is string => typeof u === "string" && !!u);

  const [src, setSrc] = useState<string | undefined>(candidates[0]);
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const nextCandidates = [
      ...(typeof srcProp === "string" ? [srcProp] : []),
      ...(fallbackSrc ? [fallbackSrc] : []),
      ...(fallbackSrcs ?? []),
    ].filter((u): u is string => typeof u === "string" && !!u);

    setSrc(nextCandidates[0] ?? undefined);
    setAttemptIndex(0);
    setBroken(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcProp, fallbackSrc, fallbackSrcs]);

  const handleError = () => {
    const currentIndex = candidates.findIndex((candidate) => candidate === src);
    const nextIndex = Math.max(currentIndex + 1, 0);
    const next = candidates[nextIndex];

    if (next && next !== src) {
      setSrc(next);
      setAttemptIndex(nextIndex + 1);
      return;
    }

    setBroken(true);
  };

  if (broken || !src) {
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