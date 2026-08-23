import { Spectral, Be_Vietnam_Pro } from "next/font/google";

/**
 * Bộ font chuẩn cho toàn site — thay cho @import Google Fonts thủ công
 * trong globals.css hiện tại.
 *
 * Lý do đổi:
 * - Cinzel (font-display cũ) KHÔNG hỗ trợ đủ dấu thanh tiếng Việt → mọi
 *   heading tiếng Việt đang âm thầm fallback sang font hệ thống, phá vỡ
 *   sự đồng bộ (khác biệt rất rõ giữa "LEIBO" và "Nhân vật mới cập nhật"
 *   trong cùng 1 trang).
 * - next/font tự inline font vào build, loại bỏ round-trip tới Google
 *   Fonts CDN lúc runtime (nhanh hơn @import trong CSS), và tự thêm
 *   font-display: swap + size-adjust để tránh nhảy layout khi font tải.
 *
 * subsets: "vietnamese" bắt buộc phải khai báo tường minh — nếu bỏ qua,
 * next/font chỉ tải bảng "latin" mặc định và toàn bộ dấu tiếng Việt sẽ
 * rơi về font hệ thống dù package font gốc có hỗ trợ.
 */

export const spectral = Spectral({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});
