"use client";

import { useLocale, useTranslations } from "next-intl";
import { ElementIcon } from "@/components/character/ElementIcon";
import { GlossaryText } from "@/components/glossary/GlossaryText";
import {
  ELEMENT_ICON_URLS,
  ELEMENTAL_RESONANCES,
  getLunarResonance,
  getHexereiInfo,
  HEXEREI_WAVE_1,
  HEXEREI_NEW_WITCHES,
  getWitchRevelationInfo,
  WITCH_REVELATION_CHARACTERS,
  getResonanceName,
  getResonanceDescription,
} from "@/lib/game/element-reactions-data";
import { CharacterGroup } from "./CharacterGroup";

export function ResonanceAndFactionPanel() {
  const t = useTranslations("ReactionTabs");
  const locale = useLocale();
  const lunar = getLunarResonance(locale);
  const hexerei = getHexereiInfo(locale);
  const witchRevelation = getWitchRevelationInfo(locale);

  return (
    <div className="space-y-8">
      {/* Cộng hưởng Nguyên tố */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{t("elementalResonanceTitle")}</h3>
        <p className="text-xs text-text-muted mb-3">{t("elementalResonanceNote")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ELEMENTAL_RESONANCES.map((res) => (
            <div key={res.id} className="relic-frame bg-bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <ElementIcon vision={res.element} iconUrl={ELEMENT_ICON_URLS[res.element]} size={18} />
                <span className="font-semibold text-text-primary text-sm">{getResonanceName(res, locale)}</span>
              </div>
              <p className="text-xs text-text-secondary">
                <GlossaryText text={getResonanceDescription(res, locale)} excludeId={`resonance-${res.id}`} />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cộng hưởng Nguyệt */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{lunar.name}</h3>
        <p className="text-xs text-text-muted mb-1">{lunar.requirement}</p>
        <p className="text-sm text-text-secondary mb-3">
          <GlossaryText text={lunar.description} />
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lunar.scalings.map((s, i) => (
            <div key={i} className="relic-frame bg-bg-card border border-border rounded-lg p-3 text-sm">
              <div className="flex items-center gap-1.5 mb-1">
                {s.elements.map((elName) => (
                  <ElementIcon key={elName} vision={elName} iconUrl={ELEMENT_ICON_URLS[elName]} size={16} />
                ))}
              </div>
              <div className="text-text-secondary mb-1">
                {s.statLabel}: <span className="text-gold-bright font-medium">{s.ratePerUnit}</span>
              </div>
              <div className="text-[11px] text-text-muted italic">
                {t("exampleAbbrev")}: {s.example}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          {t("maxBonusPerActivation", { max: lunar.maxBonus })} · {t("releasedInVersion", { version: lunar.gameVersion })}
        </p>
      </div>

      {/* Hexerei */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{hexerei.name}</h3>
        <p className="text-xs text-text-muted mb-1">{hexerei.requirement}</p>
        <p className="text-sm text-text-secondary mb-3">
          <GlossaryText text={hexerei.description} />
        </p>
        <CharacterGroup label={t("wave1")} names={HEXEREI_WAVE_1} />
        <CharacterGroup label={t("newWitchesWithHexerei")} names={HEXEREI_NEW_WITCHES} />
      </div>

      {/* Khải Huyền Của Ma Nữ (Witch's Revelation) */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{witchRevelation.name}</h3>
        <p className="text-xs text-text-muted mb-1">{witchRevelation.requirement}</p>
        <p className="text-sm text-text-secondary mb-3">
          <GlossaryText text={witchRevelation.description} />
        </p>
        <CharacterGroup
          label={t("versionLabel", { version: witchRevelation.gameVersion })}
          names={WITCH_REVELATION_CHARACTERS}
        />
        <p className="text-[11px] text-text-muted mt-2">{t("witchRevelationNote")}</p>
      </div>
    </div>
  );
}
