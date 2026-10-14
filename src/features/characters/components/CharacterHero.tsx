import type { Character } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { ElementIcon } from "./ElementIcon";
import { SafeImage } from "@/components/ui/SafeImage";
import { RarityStars } from "@/components/ui/RarityStars";
import { ElementalFrame } from "@/components/ui/ElementalFrame";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { getElementNameByKey } from "@/core/game/element-reactions-data";
import { resolveCharacterCardImage, type VoiceActors } from "@/core/game/character-helpers";

export interface CharacterHeroProps {
  character: Character;
  isTraveler: boolean;
  boySplash: string | null;
  girlSplash: string | null;
  locale: string;
  elementColor: string;
  localizedDescription: string | null;
  voiceActors: VoiceActors | null;
}

export async function CharacterHero({
  character: c,
  isTraveler,
  boySplash,
  girlSplash,
  locale,
  elementColor: el,
  localizedDescription,
  voiceActors,
}: CharacterHeroProps) {
  const t = await getTranslations({ locale, namespace: "CharacterDetail" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });
  const tRegion = await getTranslations({ locale, namespace: "Region" });
  const tCharacters = await getTranslations({ locale, namespace: "Characters" });

  const characterName = isTraveler
    ? `${tCharacters("traveler")} (${getElementNameByKey(c.vision, locale)})`
    : getLocalizedName(c, locale);

  return (
    <ElementalFrame
      element={c.vision}
      variant="premium"
      className="mb-10 overflow-hidden"
    >
      <div className="p-6 flex flex-col sm:flex-row gap-6">
        {isTraveler ? (
          <div
            className="relative w-full sm:w-56 aspect-[3/4] rounded-xl overflow-hidden shrink-0 shadow-lg"
            style={{
              background: `radial-gradient(ellipse at 50% 25%, color-mix(in srgb, ${el} 45%, transparent) 0%, color-mix(in srgb, ${el} 20%, #081614) 55%, #081614 100%)`,
              border: `1.5px solid color-mix(in srgb, ${el} 50%, var(--border-color))`,
              boxShadow: `0 8px 30px color-mix(in srgb, ${el} 25%, transparent)`,
            }}
          >
            {boySplash && girlSplash ? (
              <>
                <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
                  <SafeImage
                    src={boySplash}
                    alt={`${c.name} - ${t("boy")}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 224px"
                    priority
                    fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]}
                  />
                </div>
                <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
                  <SafeImage
                    src={girlSplash}
                    alt={`${c.name} - ${t("girl")}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 224px"
                    priority
                    fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]}
                  />
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/40 -translate-x-1/2" />
              </>
            ) : (
              <SafeImage
                src={boySplash || girlSplash || c.iconUrl}
                alt={c.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 224px"
                priority
                fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]}
              />
            )}
          </div>
        ) : (
          <div
            className="relative w-full sm:w-56 aspect-[3/4] rounded-xl overflow-hidden shrink-0 shadow-lg"
            style={{
              background: `radial-gradient(ellipse at 50% 25%, color-mix(in srgb, ${el} 45%, transparent) 0%, color-mix(in srgb, ${el} 20%, #081614) 55%, #081614 100%)`,
              border: `1.5px solid color-mix(in srgb, ${el} 50%, var(--border-color))`,
              boxShadow: `0 8px 30px color-mix(in srgb, ${el} 25%, transparent)`,
            }}
          >
            <SafeImage
              src={resolveCharacterCardImage(c)}
              alt={c.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 224px"
              priority
              fallbackSrcs={[c.iconUrl, c.splashUrlOriginal, c.iconUrlOriginal]}
            />
          </div>
        )}

        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={22} />
            <span className="text-eyebrow" style={{ color: el }}>
              {getElementNameByKey(c.vision, locale)} · {tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
            </span>
          </div>

          <h1
            className="font-display text-display-2 font-semibold text-text-primary mb-1 game-title-glow"
            style={{ "--el": el } as React.CSSProperties}
          >
            {characterName}
          </h1>

          {c.title && <p className="text-sm text-text-muted italic mb-3 game-subtitle">&ldquo;{c.title}&rdquo;</p>}

          <div className="mb-4">
            <RarityStars count={c.rarity} size="lg" />
          </div>

          {(c.region || c.affiliation) && (
            <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">
              {c.region && (
                <>
                  {t("region")}:{" "}
                  <span className="text-text-primary">
                    {tRegion(c.region as "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Snezhnaya" | "Nod-Krai")}
                  </span>
                </>
              )}
              {c.region && c.affiliation && <span className="mx-2 text-border">·</span>}
              {c.affiliation && (
                <>
                  {t("affiliation")}: <span className="text-text-primary">{c.affiliation}</span>
                </>
              )}
            </p>
          )}

          {(c.birthday || c.constellationName || c.gameVersion) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted mb-3">
              {c.birthday && (
                <span>
                  {t("birthday")}: <span className="text-text-primary">{c.birthday}</span>
                </span>
              )}
              {c.constellationName && (
                <span>
                  {t("constellationName")}: <span className="text-text-primary">{c.constellationName}</span>
                </span>
              )}
              {c.gameVersion && (
                <span>
                  {t("releaseVersion")}: <span className="text-text-primary">{c.gameVersion}</span>
                </span>
              )}
            </div>
          )}

          {localizedDescription && (
            <p className="text-sm text-text-primary max-w-xl leading-relaxed bg-bg-elevated p-3 rounded-lg border border-border italic mb-3">
              {localizedDescription}
            </p>
          )}

          {voiceActors &&
            (voiceActors.japanese || voiceActors.english || voiceActors.chinese || voiceActors.korean) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted mb-2">
                {voiceActors.japanese && <span><strong className="text-text-secondary font-mono">JA:</strong> {voiceActors.japanese}</span>}
                {voiceActors.english && <span><strong className="text-text-secondary font-mono">EN:</strong> {voiceActors.english}</span>}
                {voiceActors.chinese && <span><strong className="text-text-secondary font-mono">ZH:</strong> {voiceActors.chinese}</span>}
                {voiceActors.korean && <span><strong className="text-text-secondary font-mono">KO:</strong> {voiceActors.korean}</span>}
              </div>
            )}

          {c.wikiUrl && (
            <a
              href={c.wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline underline-offset-2 w-fit"
              style={{ color: el }}
            >
              {t("viewOnWiki")} &rarr;
            </a>
          )}
        </div>
      </div>
    </ElementalFrame>
  );
}
