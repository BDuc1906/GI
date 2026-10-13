import { SectionHeading } from "@/components/layout/SectionHeading";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { SimilarList, SimilarNote } from "@/features/similarity/components/SimilarList";
import type { SimilarCharacterSummary } from "@/features/similarity/similarity-service";

export interface CharacterSimilarSectionProps {
  similar: {
    sameElement: SimilarCharacterSummary[];
    all: SimilarCharacterSummary[];
  };
  vision: string;
  elementColor: string;
  locale: string;
}

export function CharacterSimilarSection({
  similar,
  vision,
  elementColor: el,
  locale,
}: CharacterSimilarSectionProps) {
  const sameIds = new Set(similar.sameElement.map((x) => x.id));
  const otherElement = similar.all.filter((x) => !sameIds.has(x.id));

  if (similar.sameElement.length === 0 && otherElement.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">
      <SectionHeading elementColor={el}>Nhân vật có kỹ năng tương tự</SectionHeading>
      {similar.sameElement.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Cùng nguyên tố {vision} — phương án thay thế khi bạn chưa có nhân vật này
          </h3>
          <SimilarList
            items={similar.sameElement.map((x) => ({
              id: x.id,
              href: `/characters/${x.id}`,
              name: getLocalizedName(x, locale),
              iconUrl: x.iconUrl,
              iconUrlOriginal: x.iconUrlOriginal,
              meta: `${x.vision} · ${x.rarity}★`,
              shared: x.shared,
              round: true,
            }))}
          />
        </>
      )}
      {otherElement.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-text-primary mt-5 mb-2">
            Khác nguyên tố nhưng kỹ năng rất giống
          </h3>
          <SimilarList
            items={otherElement.map((x) => ({
              id: x.id,
              href: `/characters/${x.id}`,
              name: getLocalizedName(x, locale),
              iconUrl: x.iconUrl,
              iconUrlOriginal: x.iconUrlOriginal,
              meta: `${x.vision} · ${x.rarity}★`,
              shared: x.shared,
              round: true,
            }))}
          />
        </>
      )}
      <SimilarNote />
    </section>
  );
}
