import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Favicon LEIBO - Phong cách Lãng khách Kaedehara Kazuha
 * Biểu tượng Lá phong đỏ (Momiji) kết hợp làn gió thu Anemo xoáy lượn
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
          borderRadius: "8px",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Làn gió xoáy Anemo */}
          <path
            d="M 6 24 C 6 12 18 4 28 6 C 38 8 44 18 42 28 C 40 38 30 44 20 42 C 12 40 8 32 10 26"
            stroke="#2dd4bf"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Lá phong đỏ Kazuha Momiji */}
          <path
            d="M 24 8 
               C 25 12, 28 15, 33 13 
               C 32 17, 36 20, 41 21 
               C 36 23, 35 27, 38 32 
               C 33 30, 30 33, 29 38 
               C 27 34, 25 35, 24 41 
               C 23 35, 21 34, 19 38 
               C 18 33, 15 30, 10 32 
               C 13 27, 12 23, 7 21 
               C 12 20, 16 17, 15 13 
               C 20 15, 23 12, 24 8 Z"
            fill="#f43f5e"
            stroke="#fef08a"
            strokeWidth="2"
          />
          {/* Gân lá */}
          <path d="M 24 14 L 24 36" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M 24 22 L 31 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 24 22 L 17 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
