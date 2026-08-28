"use client";

import { useState, useEffect } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Chuyển URL R2 (r2.dev hiện tại, hoặc custom domain sau này) thành URL
 * proxy nội bộ qua /api/images/... — để next/image không cần khai báo
 * remotePatterns cho domain R2, và browser luôn gọi cùng-origin với app.
 *
 * URL không phải R2 (hotlink enka.network, static.wikia.nocookie.net,
 * upload-os-bbs.mihoyo.com...) giữ nguyên, không proxy — các domain đó
 * đã được khai báo sẵn trong next.config.ts (HOTLINK_REMOTE_PATTERNS).
 *
 * Khi sau này có domain riêng và chuyển R2_PUBLIC_URL sang Custom Domain,
 * CHỈ cần đổi biến env NEXT_PUBLIC_R2_PUBLIC_URL — không cần sửa file này.
 */
function toProxiedUrl(url: string): string {
  const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!r2PublicUrl || !url.startsWith(r2PublicUrl)) return url;

  const key = url.slice(r2PublicUrl.length).replace(/^\/+/, "");
  return `/api/images/${key}`;
}

interface SafeImageProps extends Omit<ImageProps, "src"> {
  fallbackClassName?: string;
  sizes?: string;
  /**
   * `src` được khai báo lại (nullable) so với ImageProps gốc — cho phép
   * gọi nơi khác truyền thẳng `c.iconUrl || c.splashUrl` (kiểu
   * `string | null`) mà KHÔNG phải ép về `''` khi cả 2 đều rỗng. Component
   * này tự render trạng thái rỗng có chủ đích khi không có src nào, thay vì
   * next/image nhận `src=\"\"` — next/image không hợp lệ với chuỗi rỗng, và
   * `<img src=\"\">` ở mức trình duyệt có thể tự fetch lại chính URL trang
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
  ]
    .filter((u): u is string => typeof u === "string" && !!u)
    .map(toProxiedUrl);

  const [src, setSrc] = useState<string | undefined>(candidates[0]);
  // SỬA (lint no-unused-vars): `attemptIndex` được set nhưng không bao
  // giờ đọc lại ở đâu trong component — xoá state chết này, không cần
  // thay thế bằng gì (mỗi lần thử lại, `src` tự đổi giá trị nên Image
  // đã tự re-render đúng, không cần đếm số lần thử để làm gì khác).
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const nextCandidates = [
      ...(typeof srcProp === "string" ? [srcProp] : []),
      ...(fallbackSrc ? [fallbackSrc] : []),
      ...(fallbackSrcs ?? []),
    ]
      .filter((u): u is string => typeof u === "string" && !!u)
      .map(toProxiedUrl);

    // Effect này CHÍNH LÀ để đồng bộ state nội bộ (src/broken) với props
    // từ bên ngoài mỗi khi props đổi (đúng định nghĩa "sync với external
    // input"), không phải side-effect thừa.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(nextCandidates[0] ?? undefined);
    setBroken(false);
  }, [srcProp, fallbackSrc, fallbackSrcs]);

  const handleError = () => {
    const currentIndex = candidates.findIndex((candidate) => candidate === src);
    const nextIndex = Math.max(currentIndex + 1, 0);
    const next = candidates[nextIndex];

    if (next && next !== src) {
      setSrc(next);
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
          "w-full h-full flex items-center justify-center text-text-muted text-[10px] bg-bg-secondary/30"
        }
      >
        —
      </div>
    );
  }

  return <Image {...props} src={src} alt={alt} onError={handleError} sizes={sizes} />;
}
