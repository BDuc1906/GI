import { prisma } from "@/lib/db/prisma";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { elementColorVar, rarityStars, rarityTextClass } from "@/lib/ui/theme";
import { Link } from "@/i18n/navigation";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";
import { buildCharacterTeamVariants } from "@/core/game/character-team-variants";
import type { Character } from "@prisma/client";

interface Props {
  character: Pick<Character, "id" | "name" | "vision" | "rarity">;
  locale: string;
  elementColor?: string;
}

export async function CharacterTeamVariants({ character, locale, elementColor }: Props) {
  // Lấy dữ liệu toàn bộ nhân vật thật từ PostgreSQL DB
  const dbCharacters = await prisma.character.findMany({
    where: PLAYABLE_CHARACTER_FILTER,
    select: {
      id: true,
      name: true,
      nameTranslations: true,
      vision: true,
      rarity: true,
      iconUrl: true,
    },
  });

  const allCharactersMap = new Map(
    dbCharacters.map((c) => [
      c.id,
      {
        id: c.id,
        name: c.name,
        localizedName: getLocalizedName(c, locale),
        vision: c.vision,
        rarity: c.rarity,
        iconUrl: c.iconUrl,
      },
    ])
  );

  const variants = buildCharacterTeamVariants(character, allCharactersMap, locale);

  if (variants.length === 0) return null;

  return (
    <section className="mb-10">
      <SectionHeading elementColor={elementColor}>
        Đội Hình Đề Xuất & Biến Thể Tác Chiến
      </SectionHeading>
      <p className="text-sm text-text-secondary mb-6 -mt-2">
        Các đội hình tối ưu hóa theo cơ chế phản ứng nguyên tố cho từng tình huống chiến đấu cụ thể
        (Boss đơn mục tiêu, La Hoàn Thâm Cảnh quái đông, hoặc an toàn có khiên).
      </p>

      <div className="space-y-6">
        {variants.map((variant) => (
          <div
            key={variant.variantId}
            className="surface-card p-5 rounded-2xl border border-border hover:border-accent-500/60 transition-all flex flex-col gap-4"
          >
            {/* Header biến thể */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base sm:text-lg font-bold text-text-primary">
                    {variant.nameVi}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-accent-500/40 bg-accent-500/10 text-accent-bright font-medium shrink-0">
                    {variant.archetypeVi}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  <span className="font-medium text-text-primary">Tình huống:</span>{" "}
                  {variant.situationVi}
                </p>
              </div>

              <Link
                href={variant.teamBuilderUrl}
                className="text-xs px-3 py-1.5 rounded-lg border border-accent-500/50 bg-bg-elevated text-accent-bright hover:border-accent-500 hover:bg-bg-elevated/80 transition-colors shrink-0 self-start sm:self-auto font-medium"
              >
                Mở trong Team Builder ↗
              </Link>
            </div>

            {/* 4 thành viên đội hình */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {variant.members.map((member, mIdx) => {
                const el = elementColorVar(member.vision);
                const isCurrent = member.id === character.id;

                return (
                  <Link
                    key={`${variant.variantId}-${member.id}-${mIdx}`}
                    href={`/characters/${member.id}`}
                    className={`surface-card p-3 rounded-xl border flex flex-col items-center text-center group transition-transform hover:scale-[1.02] ${
                      isCurrent
                        ? "border-accent-500/70 bg-bg-elevated/90 ring-1 ring-accent-500/30"
                        : "border-border bg-bg-elevated/40"
                    }`}
                    style={{ borderTop: `3px solid ${el}` }}
                  >
                    <div className="relative w-16 h-16 rounded-xl bg-bg-elevated border border-border shrink-0 overflow-hidden mb-2">
                      {member.iconUrl ? (
                        <SafeImage
                          src={member.iconUrl}
                          alt={member.localizedName}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                          {member.vision}
                        </div>
                      )}
                    </div>

                    <div className="font-semibold text-xs sm:text-sm text-text-primary group-hover:text-accent-bright transition-colors truncate w-full">
                      {member.localizedName}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                      <span className={rarityTextClass(member.rarity)}>
                        {rarityStars(member.rarity)}
                      </span>
                      <span className="text-text-muted">·</span>
                      <span style={{ color: el }} className="font-medium">
                        {member.vision}
                      </span>
                    </div>

                    <div className="text-[10px] text-text-secondary mt-1 px-1.5 py-0.5 rounded bg-bg-overlay/60 border border-border/80 w-full truncate">
                      {member.roleVi}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Cơ chế kích hoạt: Phản ứng + Cộng hưởng */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-bg-overlay/40 p-3 rounded-xl border border-border">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-text-muted font-medium">Phản ứng:</span>
                {variant.reactionsVi.map((reac, rIdx) => (
                  <span
                    key={rIdx}
                    className="px-2 py-0.5 rounded bg-bg-elevated border border-border text-text-primary font-medium text-[11px]"
                  >
                    {reac}
                  </span>
                ))}
              </div>

              {variant.resonancesVi.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-text-muted font-medium">Cộng hưởng:</span>
                  {variant.resonancesVi.map((res, resIdx) => (
                    <span
                      key={resIdx}
                      className="px-2 py-0.5 rounded bg-accent-500/10 border border-accent-500/30 text-accent-bright font-medium text-[11px]"
                    >
                      {res}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
