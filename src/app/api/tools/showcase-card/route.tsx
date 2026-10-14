// src/app/api/tools/showcase-card/route.tsx
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";

// BẮT BUỘC Node.js runtime — KHÔNG được đổi sang "edge".
//
// Lý do: route này import @/lib/db/prisma, file đó khởi tạo PrismaClient
// bằng @prisma/adapter-pg + pg.Pool (driver TCP thuần Node.js, xem
// src/lib/db/prisma.ts). Edge Runtime của Vercel KHÔNG có TCP socket và
// KHÔNG có các module node:* — bundle sẽ fail với lỗi
// "Edge Function referencing unsupported modules: node:util/types"
// (transitive dependency của pg).
//
// Nếu sau này thực sự cần chạy route này trên Edge để render OG image ở
// gần người dùng hơn: phải đổi adapter DB cho RIÊNG route này sang
// @neondatabase/serverless + @prisma/adapter-neon (HTTP/WebSocket driver,
// tương thích Edge), KHÔNG đổi runtime trước rồi mới tính sau.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Ánh xạ vision -> gradient colors cho background thẻ */
const ELEMENT_GRADIENTS: Record<string, [string, string, string]> = {
  Pyro:    ["#7f1d1d", "#991b1b", "#dc2626"],
  Hydro:   ["#1e3a5f", "#1e40af", "#3b82f6"],
  Anemo:   ["#064e3b", "#065f46", "#10b981"],
  Electro: ["#4c1d95", "#5b21b6", "#8b5cf6"],
  Dendro:  ["#14532d", "#166534", "#22c55e"],
  Cryo:    ["#164e63", "#155e75", "#06b6d4"],
  Geo:     ["#78350f", "#92400e", "#f59e0b"],
  Physical:["#1f2937", "#374151", "#9ca3af"],
};

/** Màu accent cho mỗi nguyên tố */
const ELEMENT_ACCENT: Record<string, string> = {
  Pyro:    "#fca5a5",
  Hydro:   "#93c5fd",
  Anemo:   "#6ee7b7",
  Electro: "#c4b5fd",
  Dendro:  "#86efac",
  Cryo:    "#a5f3fc",
  Geo:     "#fcd34d",
  Physical:"#d1d5db",
};

const RARITY_COLOR: Record<number, string> = {
  5: "#b45309",
  4: "#7e22ce",
  3: "#1e40af",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const characterId   = searchParams.get("characterId");
    const levelParam    = searchParams.get("level");
    const constellParam = searchParams.get("constellations");
    const weaponParam   = searchParams.get("weapon");

    if (!characterId) {
      return new Response("Missing characterId", { status: 400 });
    }

    const level         = Math.min(90, Math.max(1, Number(levelParam) || 90));
    const constellations = Math.min(6, Math.max(0, Number(constellParam) || 0));

    // Dynamic import Prisma — chạy được trên Node.js runtime (adapter là
    // @prisma/adapter-pg + pg.Pool, xem src/lib/db/prisma.ts). KHÔNG được
    // đổi `runtime` ở đầu file thành "edge": adapter này cần TCP socket,
    // Edge Runtime không có, bundle sẽ fail với lỗi
    // "Edge Function referencing unsupported modules: node:util/types".
    const { prisma } = await import("@/lib/db/prisma");

    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
    });

    if (!character) {
      return new Response("Character not found", { status: 404 });
    }

    let weaponName: string | null = null;
    let weaponRarity: number | null = null;
    let weaponBaseAtk: number | null = null;

    if (weaponParam) {
      const weapon = await prisma.weapon.findUnique({
        where: { id: weaponParam },
        select: { name: true, rarity: true, baseAtk: true },
      });
      if (weapon) {
        weaponName    = weapon.name;
        weaponRarity  = weapon.rarity;
        weaponBaseAtk = weapon.baseAtk;
      }
    }

    const vision     = character.vision ?? "Physical";
    const [c1, c2, c3] = ELEMENT_GRADIENTS[vision] ?? ELEMENT_GRADIENTS.Physical;
    const accent     = ELEMENT_ACCENT[vision] ?? "#ffffff";
    const rarityClr  = RARITY_COLOR[character.rarity] ?? RARITY_COLOR[3];
    const stars      = "★".repeat(character.rarity);
    const iconSrc    = character.iconUrl ?? character.iconUrlOriginal ?? "";

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            display: "flex",
            fontFamily: "sans-serif",
            background: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative blobs */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "360px",
              height: "360px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "200px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
            }}
          />

          {/* Character icon */}
          <div
            style={{
              width: "340px",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {iconSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconSrc}
                width={280}
                height={280}
                style={{
                  borderRadius: "50%",
                  border: `4px solid ${accent}`,
                  boxShadow: `0 0 60px ${accent}66`,
                  objectFit: "cover",
                }}
                alt={character.name}
              />
            ) : (
              <div
                style={{
                  width: "280px",
                  height: "280px",
                  borderRadius: "50%",
                  border: `4px solid ${accent}`,
                  background: "#00000044",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "80px",
                }}
              >
                ?
              </div>
            )}
          </div>

          {/* Info panel */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px 60px 48px 20px",
              gap: "16px",
            }}
          >
            {/* Vision badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#00000044",
                border: `1px solid ${accent}66`,
                borderRadius: "100px",
                padding: "6px 18px",
                width: "fit-content",
              }}
            >
              <span style={{ color: accent, fontSize: "15px", fontWeight: 600 }}>
                {vision.toUpperCase()}
              </span>
              <span style={{ color: "#ffffff88", fontSize: "14px" }}>·</span>
              <span style={{ color: "#ffffff99", fontSize: "14px" }}>
                {character.weaponType}
              </span>
            </div>

            {/* Character name */}
            <div
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                textShadow: `0 4px 24px ${accent}88`,
              }}
            >
              {character.name}
            </div>

            {/* Stars */}
            <div style={{ fontSize: "28px", color: rarityClr, letterSpacing: "4px" }}>
              {stars}
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginTop: "8px",
              }}
            >
              {/* Level */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  background: "#00000044",
                  borderRadius: "12px",
                  padding: "14px 24px",
                  border: `1px solid ${accent}44`,
                  minWidth: "100px",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#ffffff88", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Level
                </span>
                <span style={{ color: "#ffffff", fontSize: "32px", fontWeight: 700 }}>
                  {level}
                </span>
              </div>

              {/* Constellation */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  background: "#00000044",
                  borderRadius: "12px",
                  padding: "14px 24px",
                  border: `1px solid ${accent}44`,
                  minWidth: "100px",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#ffffff88", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Const.
                </span>
                <span style={{ color: accent, fontSize: "32px", fontWeight: 700 }}>
                  C{constellations}
                </span>
              </div>

              {/* Weapon */}
              {weaponName && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    background: "#00000044",
                    borderRadius: "12px",
                    padding: "14px 24px",
                    border: `1px solid ${accent}44`,
                    flex: 1,
                    minWidth: "160px",
                  }}
                >
                  <span style={{ color: "#ffffff88", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Weapon
                  </span>
                  <span style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>
                    {weaponName}
                  </span>
                  {weaponBaseAtk !== null && (
                    <span style={{ color: "#ffffff66", fontSize: "13px" }}>
                      Base ATK {Math.round(weaponBaseAtk)} · {"★".repeat(weaponRarity ?? 3)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LEIBO logo watermark */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              right: "28px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: 0.7,
            }}
          >
            <span style={{ color: accent, fontSize: "18px", fontWeight: 800, letterSpacing: "2px" }}>
              LEIBO
            </span>
            <span style={{ color: "#ffffff44", fontSize: "14px" }}>
              · Genshin Tools
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // Vercel CDN cache theo URL (characterId/level/weapon đều nằm trong
        // query string) — cùng 1 combo request lại sẽ không phải render lại.
        // `force-dynamic` phía trên chỉ tắt cache nội bộ của Next.js, KHÔNG
        // tắt cache của CDN/browser — nên vẫn set header này để đỡ tốn CPU.
        headers: {
          "Cache-Control":
            "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (err) {
    if (err instanceof ApiError) {
      return new Response(err.message, { status: err.status });
    }
    console.error("[showcase-card] Error generating card:", err);
    return new Response("Internal server error", { status: 500 });
  }
}