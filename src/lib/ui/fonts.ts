/**
 * Font system đơn giản, hiện đại 2026 - không fancy, không màu mè
 * 
 * Chỉ dùng Inter hoặc system default fonts - đơn giản, dễ đọc, professional
 */

import { Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Export aliases cho compatibility
export const spectral = inter;
export const beVietnamPro = inter;