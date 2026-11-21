import { getTranslations } from "next-intl/server";
import type { Character } from "@prisma/client";
import { resolveCharacterCardImage } from "@/core/game/character-helpers";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { getElementNameByKey } from "@/core/game/element-reactions-data";
import type { CharacterGrouping, TravelerBucket } from "@/features/characters/listing";
import { localCharacterIcon } from "@/lib/ui/local-assets";
import { CharacterCard } from "@/features/characters/components/CharacterCard";
import { EntityGrid, ListEmptyState } from "@/components/list-layout";

interface CharacterListingGridProps {
  locale: string;
  grouping: CharacterGrouping;
}

/**
 * Lưới hiển thị danh sách nhân vật phân nhóm theo Phẩm cấp sao và Nhà Lữ Hành.
 * Sử dụng EntityGrid chuẩn hóa responsive (2-8 cột, loại bỏ ép 10 cột) và ListEmptyState.
 */
export async function CharacterListingGrid({ locale, grouping }: CharacterListingGridProps) {
  const t = await getTranslations({ locale, namespace: "Characters" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });

  const { travelerByElement, rarityGroups, sortedRarities, hasResults } = grouping;

  if (!hasResults) {
    return (
      <ListEmptyState
        title={t("noResults")}
        description="Không tìm thấy nhân vật nào phù hợp với bộ lọc hiện tại. Hãy thử chọn nguyên tố hoặc loại vũ khí khác."
        resetHref="/characters"
        resetLabel={t("clearFilters")}
      />
    );
  }

  return (
    <div className="space-y-10">
      {/* ── NHÓM NHÀ LỮ HÀNH (TRAVELER THEO NGUYÊN TỐ) ── */}
      {travelerByElement.size > 0 && (
        <section aria-labelledby="heading-traveler">
          <div className="mb-3.5 pb-2 border-b border-border/50 flex items-center justify-between">
            <h2
              id="heading-traveler"
              className="text-xs sm:text-sm font-bold tracking-wider uppercase text-accent-bright"
            >
              {t("traveler")} · {travelerByElement.size} {t("elements")}
            </h2>
            <span className="text-[11px] text-text-muted">
              Nhà Lữ Hành đa nguyên tố
            </span>
          </div>

          <EntityGrid variant="character">
            {Array.from(travelerByElement.entries()).map(
              ([el, { boy, girl }]: [string, TravelerBucket], index: number) => {
                const target = (boy ?? girl) as Character;
                const boyImg = boy ? resolveCharacterCardImage(boy) : null;
                const girlImg = girl ? resolveCharacterCardImage(girl) : null;
                return (
                  <div key={`traveler-${el}`} className="h-full">
                    <CharacterCard
                      id={target.id}
                      name={`${t("traveler")} (${getElementNameByKey(el, locale)})`}
                      vision={el}
                      weaponType={tWeaponType("Sword")}
                      rarity={target.rarity}
                      imageSrc={boyImg || girlImg || "/local-genshin-assets/characters/icon/aether.png"}
                      fallbackSrcs={[
                        boy?.iconUrlOriginal,
                        girl?.iconUrlOriginal,
                        "/local-genshin-assets/characters/icon/aether.png",
                        "/local-genshin-assets/characters/icon/lumine.png",
                      ]}
                      priority={index < 8}
                      elementIcon={target.elementIcon}
                    />
                  </div>
                );
              }
            )}
          </EntityGrid>
        </section>
      )}

      {/* ── NHÓM THEO PHẨM CẤP SAO (5★, 4★) ── */}
      {sortedRarities.map((r: number) => {
        const characters = rarityGroups.get(r) || [];
        return (
          <section key={r} aria-labelledby={`heading-rarity-${r}`}>
            <div
              className="sticky top-16 z-10 bg-bg-primary/95 backdrop-blur-md py-2 px-1 mb-4 text-xs font-bold tracking-wider uppercase border-b border-border/50 flex items-center justify-between"
              style={{ color: `var(--rarity-${r >= 5 ? 5 : r === 4 ? 4 : 3})` }}
            >
              <h2 id={`heading-rarity-${r}`} className="flex items-center gap-1.5">
                <span>{"★".repeat(r)}</span>
                <span>·</span>
                <span>{t("rarityGroupCount", { count: characters.length })}</span>
              </h2>
              <span className="text-[11px] text-text-muted font-normal normal-case">
                {r === 5 ? "Nhân vật 5 sao giới hạn & thường" : "Nhân vật 4 sao"}
              </span>
            </div>

            <EntityGrid variant="character">
              {characters.map((c: Character, index: number) => (
                <div key={c.id} className="h-full">
                  <CharacterCard
                    id={c.id}
                    name={getLocalizedName(c, locale)}
                    vision={c.vision}
                    weaponType={tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
                    rarity={c.rarity}
                    imageSrc={resolveCharacterCardImage(c)}
                    fallbackSrcs={[localCharacterIcon(c.id), c.iconUrlOriginal]}
                    priority={r === 5 && index < 8}
                    elementIcon={c.elementIcon}
                  />
                </div>
              ))}
            </EntityGrid>
          </section>
        );
      })}
    </div>
  );
}
