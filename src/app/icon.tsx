import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon LEIBO - Phong cách Lãng khách Kaedehara Kazuha
 * Biểu tượng Lá phong đỏ (Momiji) với gân lá trắng ngà và vòng lụa gió Anemo
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
          background: "#081614",
          borderRadius: "8px",
          position: "relative",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Làn gió xoáy Anemo */}
          <path
            d="M 14 56 C 10 36, 22 14, 48 12 C 76 10, 92 28, 88 56 C 84 80, 62 92, 40 88 C 22 84, 14 70, 18 56"
            stroke="#2dd4bf"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Lá phong đỏ Inazuma Momiji */}
          <path
            d="M 50 6 C 53 17, 56 22, 63 24 C 58 28, 56 34, 57 41 C 64 35, 68 31, 74 30 C 73 36, 78 37, 90 40 C 82 46, 80 49, 81 54 C 74 55, 69 55, 66 58 C 74 61, 79 64, 84 69 C 76 72, 73 73, 69 74 C 64 70, 57 70, 52 74 L 52 95 C 52 96, 48 96, 48 95 L 48 74 C 43 70, 36 70, 31 74 C 27 73, 24 72, 16 69 C 21 64, 26 61, 34 58 C 31 55, 26 55, 19 54 C 20 49, 18 46, 10 40 C 22 37, 27 36, 26 30 C 32 31, 36 35, 43 41 C 44 34, 42 28, 37 24 C 44 22, 47 17, 50 6 Z"
            fill="#e11d48"
            stroke="#ffffff"
            strokeWidth="3"
          />

          {/* Gân lá trắng sắc nét */}
          <path d="M 50 74 L 50 14" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <path d="M 50 74 L 88 41" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 50 74 L 12 41" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 50 74 L 82 68" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M 50 74 L 18 68" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
