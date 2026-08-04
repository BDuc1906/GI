import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Ảnh Open Graph riêng cho từng trang chi tiết nhân vật — Next.js tự khớp
 * file này với đúng segment /characters/[id], override ảnh mặc định ở
 * app/opengraph-image.tsx cho riêng nhóm route này, nhận params y hệt
 * page.tsx cùng cấp.
 *
 * Đây là nơi giá trị chia sẻ link cao nhất trong site (người xem build hay
 * dẫn thẳng link 1 nhân vật cụ thể vào Discord để bàn luận) nên ưu tiên làm
 * riêng thay vì dùng chung ảnh mặc định. Cùng pattern này áp dụng được
 * tương tự cho /weapons/[id], /artifacts/[id], /domains/[id] — chưa làm ở
 * đây vì mỗi route cần chọn field ảnh đại diện khác nhau (iconUrl thay vì
 * splashUrl) và cách trình bày văn bản khác nhau, cần làm riêng từng cái.
 */
export default async function CharacterOgImage({ params }: Props) {
  const { id } = await params;
  const c = await prisma.character.findUnique({
    where: { id },
    select: {
      name: true,
      vision: true,
      weaponType: true,
      rarity: true,
      splashUrl: true,
      iconUrl: true,
    },
  });

  const imageSrc = c?.splashUrl ?? c?.iconUrl ?? null;
  const stars = c ? "★".repeat(c.rarity) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0d0d0d",
          position: "relative",
        }}
      >
        {imageSrc && (
          // Ảnh nhân vật full-bleed bên phải — ImageResponse (satori) tự
          // fetch URL này lúc render, không đi qua next/image nên whitelist
          // remotePatterns trong next.config.ts không áp dụng ở đây.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt=""
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Khối màu đặc (không dùng gradient) phủ nửa trái để chữ luôn đọc
            được bất kể ảnh nhân vật sáng/tối thế nào — an toàn hơn gradient
            trong satori (engine render của ImageResponse có hỗ trợ giới hạn
            hơn CSS thật, ưu tiên thuộc tính chắc chắn render đúng). */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: imageSrc ? "58%" : "100%",
            height: "100%",
            background: "#0d0d0d",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            padding: "0 0 0 64px",
            maxWidth: 620,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#C9A66B",
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            LEIBO — Genshin Impact Database
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              color: "#f0ece4",
              lineHeight: 1.1,
            }}
          >
            {c?.name ?? "Không tìm thấy nhân vật"}
          </div>
          {c && (
            <>
              <div
                style={{ display: "flex", fontSize: 30, color: "#F4D03F", marginTop: 14 }}
              >
                {stars}
              </div>
              <div
                style={{ display: "flex", fontSize: 28, color: "#a8a4a0", marginTop: 12 }}
              >
                {c.vision} · {c.weaponType}
              </div>
            </>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
