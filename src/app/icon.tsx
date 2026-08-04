import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon sinh bằng code (Next.js App Router quy ước: file `icon.tsx` ngay
 * trong app/ tự động trở thành favicon, không cần khai báo gì thêm trong
 * metadata hay <head>).
 *
 * Trước đây thư mục public/ hoàn toàn trống — không có favicon.ico nào,
 * trình duyệt hiển thị icon mặc định/trống trên tab. Dùng ImageResponse để
 * không phụ thuộc một file .ico/.png thiết kế tay nào — hình khối đơn giản
 * (kim cương vàng) để tránh vẽ lại bất kỳ icon/logo nào của Genshin Impact
 * (thuộc bản quyền miHoYo/HoYoverse), chỉ dùng đúng bảng màu thương hiệu đã
 * có sẵn trong globals.css (--bg-primary, --gold-bright).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            background: "#F4D03F",
            transform: "rotate(45deg)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
