import { prisma } from "@/lib/db/prisma";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { elementColorVar, rarityStars, rarityTextClass } from "@/lib/ui/theme";
import { Link } from "@/i18n/navigation";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";
import type { Weapon } from "@prisma/client";

interface Props {
  weapon: Pick<Weapon, "id" | "name" | "type" | "rarity" | "subStatName" | "effectName" | "passiveByRefinement">;
  locale: string;
  weaponColor?: string;
}

interface CharacterMatch {
  id: string;
  name: string;
  nameTranslations: unknown;
  vision: string;
  rarity: number;
  iconUrl: string | null;
  score: number;
  reason: string;
}

export async function WeaponRecommendedCharacters({ weapon, locale, weaponColor }: Props) {
  // Query các nhân vật thật trong DB cùng loại vũ khí
  const characters = await prisma.character.findMany({
    where: {
      AND: [
        PLAYABLE_CHARACTER_FILTER,
        { weaponType: weapon.type },
      ],
    },
    select: {
      id: true,
      name: true,
      nameTranslations: true,
      vision: true,
      rarity: true,
      iconUrl: true,
      ascensionStat: true,
    },
  });

  if (characters.length === 0) return null;

  const sub = (weapon.subStatName ?? "").toLowerCase();
  const desc = JSON.stringify(weapon.passiveByRefinement ?? "").toLowerCase();

  // Chấm điểm độ tương thích dựa trên thông số thật trong game
  const matches: CharacterMatch[] = characters.map((c) => {
    let score = c.rarity === 5 ? 2 : 1;
    let reason = "Tương thích loại vũ khí";
    const asc = (c.ascensionStat ?? "").toLowerCase();
    const cName = c.name.toLowerCase();

    // 1. Nhân vật phụ thuộc HP (Scale HP)
    const isHpScaler = ["hu tao", "zhongli", "neuvillette", "furina", "nilou", "yelan", "kokomi", "baizhu", "kuki shinobu", "chevreuse", "layla", "diona", "thoma"].some((k) => cName.includes(k));
    if ((sub.includes("hp") || desc.includes("hp")) && isHpScaler) {
      score += 8;
      reason = "Tận dụng tối đa chỉ số HP";
    }

    // 2. Nhân vật phụ thuộc DEF (Scale DEF)
    const isDefScaler = ["itto", "albedo", "noelle", "chiori", "xilonen", "gorou", "yun jin", "kachina"].some((k) => cName.includes(k));
    if ((sub.includes("def") || desc.includes("def")) && isDefScaler) {
      score += 8;
      reason = "Tận dụng tối đa chỉ số Phòng Ngự (DEF)";
    }

    // 3. Tinh Thông Nguyên Tố (EM)
    const isEmScaler = c.vision === "Anemo" || c.vision === "Dendro" || ["xiangling", "hu tao", "kazuha", "sucrose", "shinobu", "cyno", "tighnari", "alhaitham"].some((k) => cName.includes(k));
    if ((sub.includes("elemental mastery") || desc.includes("elemental mastery")) && isEmScaler) {
      score += 6;
      reason = "Phát huy uy lực Phản ứng Nguyên tố (EM)";
    }

    // 4. Hiệu Quả Nạp (ER)
    const isErNeeder = ["raiden", "xiangling", "bennett", "xingqiu", "yelan", "faruzan", "gorou", "yun jin", "mika", "chevreuse", "charlotte"].some((k) => cName.includes(k));
    if (sub.includes("energy recharge") && isErNeeder) {
      score += 6;
      reason = "Cung cấp chu chuyển Nộ liên tục (ER)";
    }

    // 5. Sát Thương Vật Lý (Physical)
    const isPhys = ["eula", "razor", "freminet", "mika", "rosaria"].some((k) => cName.includes(k));
    if (sub.includes("physical") && isPhys) {
      score += 9;
      reason = "Gia tăng mạnh Sát Thương Vật Lý";
    }

    // 6. Tỉ Lệ Bạo Kích / Sát Thương Bạo Kích (CRIT)
    const isCritDps = asc.includes("crit") || asc.includes("dmg") || ["raiden", "xiao", "hu tao", "arlecchino", "ayaka", "ayato", "alhaitham", "navia", "ganyu", "tighnari", "lyney", "clorinde", "kinich", "mualani", "childe", "keqing", "diluc", "yoimiya", "wanderer", "wriothesley"].some((k) => cName.includes(k));
    if (sub.includes("crit") && isCritDps) {
      score += 5;
      reason = "Tối ưu hóa chỉ số Bạo Kích cho chủ lực";
    }

    return {
      id: c.id,
      name: c.name,
      nameTranslations: c.nameTranslations,
      vision: c.vision,
      rarity: c.rarity,
      iconUrl: c.iconUrl,
      score,
      reason,
    };
  });

  // Lọc top 4 - 6 nhân vật có điểm cao nhất
  const topCharacters = matches
    .filter((m) => m.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (topCharacters.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionHeading elementColor={weaponColor}>Nhân vật phù hợp khuyên dùng</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCharacters.map((c, idx) => {
          const el = elementColorVar(c.vision);
          const localizedName = getLocalizedName(c, locale);
          const isTopTier = idx === 0 || c.score >= 8;

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
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-medium text-sm text-text-primary group-hover:text-accent-bright transition-colors truncate">
                    {localizedName}
                  </span>
                  {isTopTier && (
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-bright shrink-0">
                      Đề xuất
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={rarityTextClass(c.rarity)}>{rarityStars(c.rarity)}</span>
                  <span className="text-text-muted">·</span>
                  <span style={{ color: el }} className="font-medium">
                    {c.vision}
                  </span>
                </div>

                <div className="text-[11px] text-text-secondary mt-1 truncate" title={c.reason}>
                  {c.reason}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
