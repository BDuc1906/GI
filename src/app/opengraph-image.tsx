import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "LEIBO — Genshin Impact Database";

/**
 * Ảnh Open Graph mặc định (Next.js App Router quy ước: file
 * `opengraph-image.tsx` ngay trong app/ tự động gắn vào metadata của mọi
 * route con KHÔNG có opengraph-image.tsx riêng — ví dụ trang chủ, trang
 * danh sách /characters, /weapons...).
 *
 * Trước đây layout.tsx đã khai báo `openGraph`/`twitter` metadata (title,
 * description) nhưng KHÔNG có field `images` nào — dán link web lên
 * Discord/Zalo/Facebook/X chỉ hiện khung preview trống, không có ảnh, dù
 * text preview vẫn đúng. Sinh ảnh bằng code, không cần file ảnh thiết kế
 * tay, dùng đúng bảng màu thương hiệu trong globals.css. Không dùng font
 * 'Cinzel' (Google Fonts) ở đây dù đó là font hiển thị chính của site —
 * ImageResponse cần tải sẵn font dưới dạng byte (ArrayBuffer) lúc build,
 * thêm 1 lệnh fetch mạng có thể lỗi trong lúc build nếu Google Fonts chập
 * chờn; ưu tiên ảnh OG luôn build ra được ổn định hơn là khớp 100% font
 * hiển thị trên web.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            background: "#F4D03F",
            transform: "rotate(45deg)",
            marginBottom: 48,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#f0ece4",
            letterSpacing: 6,
          }}
        >
          LEIBO
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#C9A66B",
            marginTop: 20,
          }}
        >
          Genshin Impact Database
        </div>
      </div>
    ),
    { ...size }
  );
}
