import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon LEIBO - Huy hiệu Kaedehara Kazuha
 * Hiển thị chữ 楓 (Phong/Kaede) đặc trưng với sắc ngọc Anemo trên nền ngọc đen
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
          background: "#061311",
          borderRadius: "8px",
          border: "1.5px solid #2dd4bf",
          color: "#2dd4bf",
          fontSize: "20px",
          fontWeight: 900,
        }}
      >
        楓
      </div>
    ),
    { ...size }
  );
}
