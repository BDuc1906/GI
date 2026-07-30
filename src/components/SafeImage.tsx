"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

/**
 * Wrapper quanh next/image cho ảnh hotlink từ nguồn ngoài (Enka Network,
 * Fandom Wikia...). Hai lý do dùng next/image thay vì <img> thô:
 *  1. next/image tự resize/cache/lazy-load ảnh qua server Next, giảm phụ
 *     thuộc trực tiếp vào băng thông của domain ngoài mỗi lần user tải trang.
 *  2. Có onError để ẩn ảnh gọn gàng khi hotlink hỏng (thay vì hiện icon vỡ
 *     ảnh mặc định của trình duyệt) — cùng pattern đã dùng ở ElementIcon.
 *
 * fill=true dùng cho container có kích thước cố định qua CSS (aspect-ratio,
 * width/height của thẻ cha); không set width/height trực tiếp trên props.
 */
export function SafeImage({
  fallbackClassName,
  ...props
}: ImageProps & { fallbackClassName?: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className={
          fallbackClassName ??
          "w-full h-full flex items-center justify-center text-neutral-600 text-[10px] bg-neutral-950/40"
        }
      >
        —
      </div>
    );
  }

  return <Image {...props} onError={() => setBroken(true)} unoptimized={false} />;
}