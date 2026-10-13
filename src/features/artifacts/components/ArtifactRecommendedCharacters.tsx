import { prisma } from "@/lib/db/prisma";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { elementColorVar, rarityStars, rarityTextClass } from "@/lib/ui/theme";
import { Link } from "@/i18n/navigation";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";
import type { ArtifactSet } from "@prisma/client";

interface Props {
  artifact: Pick<ArtifactSet, "id" | "name" | "twoPieceBonus" | "fourPieceBonus">;
  locale: string;
  rarityColor?: string;
}

interface CharacterMatch {
  id: string;
  name: string;
  nameTranslations: unknown;
  vision: string;
  rarity: number;
  iconUrl: string | null;
  score: number;
  roleBadge: string;
}

export async function ArtifactRecommendedCharacters({ artifact, locale, rarityColor }: Props) {
  const characters = await prisma.character.findMany({
    where: PLAYABLE_CHARACTER_FILTER,
    select: {
      id: true,
      name: true,
      nameTranslations: true,
      vision: true,
      rarity: true,
      iconUrl: true,
      ascensionStat: true,
      weaponType: true,
    },
  });

  if (characters.length === 0) return null;

  const bonusText = `${artifact.twoPieceBonus ?? ""} ${artifact.fourPieceBonus ?? ""}`.toLowerCase();
  const artSlug = artifact.id.toLowerCase();

  const matches: CharacterMatch[] = characters.map((c) => {
    let score = 0;
    let roleBadge = "Bộ 2 món hoặc 4 món";
    const cName = c.name.toLowerCase();

    // 1. Phân loại theo bộ đặc trưng meta
    if (artSlug.includes("golden-troupe")) {
      // Đoàn Kịch Hoàng Kim: tăng Elemental Skill DMG
      if (["furina", "fischl", "yae miko", "chiori", "albedo", "emilie", "nahida"].some((k) => cName.includes(k))) {
        score = 10;
        roleBadge = "Bộ 4 món tối ưu (BiS)";
      }
    } else if (artSlug.includes("emblem-of-severed-fate")) {
      // Dấu Ấn Khắc Sâu: tăng Burst DMG theo ER
      if (["raiden", "xiangling", "yelan", "xingqiu", "beidou", "kujou sara", "mona"].some((k) => cName.includes(k))) {
        score = 10;
        roleBadge = "Bộ 4 món tối ưu (BiS)";
      }
    } else if (artSlug.includes("marechaussee-hunter")) {
      // Thợ Săn Marechaussee: đổi HP nhận CRIT Rate
      if (["neuvillette", "wriothesley", "lyney", "xiao", "gaming", "hu tao", "furina"].some((k) => cName.includes(k))) {
        score = 10;
        roleBadge = "Bộ 4 món tối ưu (BiS)";
      }
    } else if (artSlug.includes("viridescent-venerer")) {
      // Bóng Hình Màu Xanh: giảm kháng khuếch tán Anemo
      if (c.vision === "Anemo") {
        score = 10;
        roleBadge = "Bộ 4 món thiết yếu (BiS)";
      }
    } else if (artSlug.includes("deepwood-memories")) {
      // Ký Ức Rừng Sâu: giảm kháng Thảo
      if (c.vision === "Dendro" || ["nahida", "alhaitham", "baizhu", "collei", "kinich", "emilie", "tighnari"].some((k) => cName.includes(k))) {
        score = 10;
        roleBadge = "Bộ 4 món thiết yếu (BiS)";
      }
    } else if (artSlug.includes("gilded-dreams") || artSlug.includes("flower-of-paradise-lost")) {
      // Giấc Mộng Hoàng Kim / Đóa Hoa Thiên Đường: phản ứng tinh thông
      if (["alhaitham", "cyno", "kuki shinobu", "thoma", "nahida", "tighnari"].some((k) => cName.includes(k))) {
        score = 9;
        roleBadge = "Bộ 4 món tối ưu (BiS)";
      }
    } else if (artSlug.includes("crimson-witch-of-flames")) {
      // Diệm Liệt Ma Nữ
      if (c.vision === "Pyro" && ["hu tao", "diluc", "klee", "yoimiya", "yanfei", "xiangling"].some((k) => cName.includes(k))) {
        score = 9;
        roleBadge = "Bộ 4 món tối ưu (BiS)";
      }
    } else if (artSlug.includes("blizzard-strayer")) {
      // Dũng Sĩ Băng Giá
      if (c.vision === "Cryo" && ["ayaka", "ganyu", "wriothesley", "rosaria", "chongyun"].some((k) => cName.includes(k))) {
        score = 9;
        roleBadge = "Bộ 4 món Đóng Băng (BiS)";
      }
    } else if (artSlug.includes("heart-of-depth") || artSlug.includes("nymph-s-dream")) {
      // Trầm Luân / Giấc Mơ Nymph
      if (c.vision === "Hydro" && ["childe", "ayato", "neuvillette", "kokomi"].some((k) => cName.includes(k))) {
        score = 9;
        roleBadge = "Bộ 4 món chủ lực";
      }
    } else if (artSlug.includes("thundering-fury")) {
      // Như Sấm Thịnh Nộ
      if (c.vision === "Electro" && ["cyno", "keqing", "fischl", "clorinde", "yae miko"].some((k) => cName.includes(k))) {
        score = 9;
        roleBadge = "Bộ 4 món tăng phản ứng";
      }
    } else if (artSlug.includes("husk-of-opulent-dreams")) {
      // Giấc Mộng Phù Hoa (DEF + Geo)
      if (c.vision === "Geo" && ["itto", "albedo", "noelle", "chiori", "gorou", "yun jin"].some((k) => cName.includes(k))) {
        score = 10;
        roleBadge = "Bộ 4 món tối ưu (BiS)";
      }
    } else if (artSlug.includes("ocean-hued-clam") || artSlug.includes("maiden-beloved")) {
      // Xà Cừ Đại Dương / Thiếu Nữ Đáng Yêu
      if (["kokomi", "baizhu", "barbara", "qiqi", "charlotte", "diona"].some((k) => cName.includes(k))) {
        score = 9;
        roleBadge = "Bộ 4 món Trị Liệu";
      }
    } else if (artSlug.includes("noblesse-oblige")) {
      // Nghi Thức Tông Thất Cổ: tăng ATK đội sau nộ
      if (["bennett", "mona", "diona", "faruzan", "rosaria", "thoma", "mika"].some((k) => cName.includes(k))) {
        score = 10;
        roleBadge = "Bộ 4 món Hỗ trợ (BiS)";
      }
    } else {
      // 2. Logic tổng quát khớp nguyên tố từ văn bản bonus
      const visionLower = c.vision.toLowerCase();
      if (bonusText.includes(`${visionLower} dmg`) || bonusText.includes(visionLower)) {
        score += 7;
        roleBadge = "Bộ 2 món hoặc 4 món";
      }

      // Khớp ATK cho DPS
      if (bonusText.includes("atk") && c.rarity === 5) {
        score += 4;
        roleBadge = "Bộ 2 món gia tăng ATK";
      }

      // Khớp HP cho HP scaler
      if (bonusText.includes("hp") && ["hu tao", "zhongli", "neuvillette", "furina", "nilou", "yelan", "kokomi", "baizhu", "kuki shinobu"].some((k) => cName.includes(k))) {
        score += 7;
        roleBadge = "Bộ 2 món hoặc 4 món HP";
      }

      // Khớp DEF cho DEF scaler
      if (bonusText.includes("def") && ["itto", "albedo", "noelle", "chiori", "xilonen", "gorou"].some((k) => cName.includes(k))) {
        score += 7;
        roleBadge = "Bộ 2 món hoặc 4 món DEF";
      }

      // Khớp EM cho Anemo/Dendro
      if ((bonusText.includes("elemental mastery") || bonusText.includes("em")) && (c.vision === "Anemo" || c.vision === "Dendro")) {
        score += 6;
        roleBadge = "Bộ 2 món Tinh Thông";
      }
    }

    return {
      id: c.id,
      name: c.name,
      nameTranslations: c.nameTranslations,
      vision: c.vision,
      rarity: c.rarity,
      iconUrl: c.iconUrl,
      score,
      roleBadge,
    };
  });

  const topCharacters = matches
    .filter((m) => m.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (topCharacters.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionHeading elementColor={rarityColor}>Nhân vật phù hợp khuyên dùng</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCharacters.map((c) => {
          const el = elementColorVar(c.vision);
          const localizedName = getLocalizedName(c, locale);

          return (
            <Link
              key={c.id}
              href={`/characters/${c.id}`}
              className="surface-card p-3.5 flex items-center gap-3.5 hover:border-accent-500/80 transition-all group"
              style={{
                borderLeft: `3px solid ${el}`,
              }}
            >
              <div className="relative w-14 h-14 rounded-xl bg-bg-elevated border border-border shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                {c.iconUrl ? (
                  <SafeImage
                    src={c.iconUrl}
                    alt={localizedName}
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                    {c.vision}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm text-text-primary group-hover:text-accent-bright transition-colors truncate mb-0.5">
                  {localizedName}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={rarityTextClass(c.rarity)}>{rarityStars(c.rarity)}</span>
                  <span className="text-text-muted">·</span>
                  <span style={{ color: el }} className="font-medium">
                    {c.vision}
                  </span>
                </div>

                <div className="text-[11px] text-accent-bright/90 mt-1 truncate font-medium">
                  {c.roleBadge}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
