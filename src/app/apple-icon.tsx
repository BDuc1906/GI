import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: "36px",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #FFE066 0%, #F4D03F 50%, #D4AC0D 100%)",
            transform: "rotate(45deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 25px rgba(244, 208, 63, 0.4)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "#0d0d0d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#FFFFFF",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
