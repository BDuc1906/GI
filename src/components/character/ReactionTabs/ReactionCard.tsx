"use client";

import { useTranslations } from "next-intl";
import { ElementIcon } from "@/components/character/ElementIcon";
import { GlossaryText } from "@/components/glossary/GlossaryText";
import {
  ELEMENT_ICON_URLS,
  ELEMENTAL_REACTIONS,
  CATEGORY_COLOR,
  elementColor,
  getReactionName,
  getReactionDescription,
  type ReactionCategory,
} from "@/lib/game/element-reactions-data";

interface ReactionCardProps {
  r: (typeof ELEMENTAL_REACTIONS)[number];
  categoryLabel: Record<ReactionCategory, string>;
  locale: string;
}

export function ReactionCard({ r, categoryLabel, locale }: ReactionCardProps) {
  const t = useTranslations("ReactionTabs");
  // Tên phản ứng Nguyệt/Tinh Vực tô màu theo nguyên tố ĐẶC TRƯNG của
  // biến thể đó (accentElement) — vd Nguyệt-Điện Cảm màu tím (Lôi),
  // Nguyệt-Sum Suê màu xanh lá (Thảo), Nguyệt-Kết Tinh màu vàng (Nham) —
  // thay vì tất cả cùng 1 màu xanh dương/tím cố định như trước.
  const titleColor = r.accentElement ? elementColor(r.accentElement) : undefined;
  const displayName = getReactionName(r, locale);
  const description = getReactionDescription(r, locale);

  return (
    <div className="relic-frame bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <span className="font-display font-bold" style={titleColor ? { color: titleColor } : undefined}>
            {displayName}
          </span>
          {displayName !== r.name && <span className="text-text-muted text-xs ml-2">({r.name})</span>}
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${CATEGORY_COLOR[r.category]}`}
        >
          {categoryLabel[r.category]}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {r.elements.map((elName, i) => (
          <span key={elName} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-text-muted text-xs">+</span>}
            <ElementIcon vision={elName} iconUrl={ELEMENT_ICON_URLS[elName]} size={18} />
          </span>
        ))}
      </div>
      <p className="text-sm text-text-secondary mb-2">
        <GlossaryText text={description} excludeId={r.id} />
      </p>
      {r.requiresCharacters && (
        <div className="text-[11px] text-text-muted pt-2 border-t border-border/60">
          {t("charactersLabel")}: {r.requiresCharacters}
        </div>
      )}
    </div>
  );
}
