"use client";

import { useState } from "react";
import { ElementIcon } from "@/components/ElementIcon";
import {
  ELEMENTAL_REACTIONS,
  ELEMENT_ICON_URLS,
  ELEMENTAL_RESONANCES,
  LUNAR_RESONANCE,
  HEXEREI_INFO,
  HEXEREI_WAVE_1,
  HEXEREI_WAVE_2,
  HEXEREI_NEW_WITCHES,
  WITCH_REVELATION_INFO,
  WITCH_REVELATION_CHARACTERS,
  elementColor,
  type ReactionCategory,
} from "@/lib/element-reactions-data";

const CATEGORY_LABEL: Record<ReactionCategory, string> = {
  amplifying: "Khuếch đại",
  transformative: "Biến đổi",
  additive: "Bổ trợ",
  lunar: "Nguyệt",
  stellar: "Tinh Vực",
};

const CATEGORY_COLOR: Record<ReactionCategory, string> = {
  amplifying: "border-orange-500/50 bg-orange-500/10 text-orange-300",
  transformative: "border-purple-500/50 bg-purple-500/10 text-purple-300",
  additive: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  lunar: "border-sky-400/50 bg-sky-400/10 text-sky-300",
  stellar: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
};

const STANDARD_REACTIONS = ELEMENTAL_REACTIONS.filter((r) => r.category !== "lunar" && r.category !== "stellar");
const LUNAR_REACTIONS = ELEMENTAL_REACTIONS.filter((r) => r.category === "lunar");
const STELLAR_REACTIONS = ELEMENTAL_REACTIONS.filter((r) => r.category === "stellar");

const REACTION_TABS = [
  { key: "standard" as const, label: "Phản ứng nguyên tố", reactions: STANDARD_REACTIONS, note: "Ai cũng kích hoạt được, không cần nhân vật đặc biệt." },
  { key: "lunar" as const, label: "Phản ứng Nguyệt", reactions: LUNAR_REACTIONS, note: "Cơ chế Moonsign. Chỉ kích hoạt được khi đội hình có nhân vật Moonsign phù hợp (xem \"Nhân vật\" ở mỗi thẻ)." },
  { key: "stellar" as const, label: "Tinh Vực (Stellar Glimmer)", reactions: STELLAR_REACTIONS, note: "Cần nhân vật mang Vision \"Stellar Linchpin\" trong đội mới kích hoạt được, không phải cứ có đúng nguyên tố là tự động có." },
  { key: "resonance" as const, label: "Cộng hưởng & Phe phái", reactions: [], note: "" },
] as const;

/**
 * ReactionTabs — 1 thanh tab bấm chuyển giữa: phản ứng nguyên tố thường /
 * phản ứng Nguyệt / Tinh Vực (Stellar Glimmer) / Cộng hưởng & Phe phái —
 * không cần cuộn trang.
 */
export function ReactionTabs() {
  const [active, setActive] = useState<(typeof REACTION_TABS)[number]["key"]>("standard");
  const current = REACTION_TABS.find((t) => t.key === active)!;

  return (
    <section className="mb-10">
      <div className="flex flex-wrap gap-2 mb-4 border-b border-border pb-3">
        {REACTION_TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                isActive
                  ? "border-gold bg-gold/20 text-gold-bright"
                  : "border-border bg-card/60 hover:border-gold/50 text-primary"
              }`}
            >
              {t.label}{t.reactions.length > 0 ? ` (${t.reactions.length})` : ""}
            </button>
          );
        })}
      </div>

      {current.key === "resonance" ? (
        <ResonanceAndFactionPanel />
      ) : (
        <>
          <p className="text-xs text-muted mb-4">{current.note}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {current.reactions.map((r) => (
              <ReactionCard key={r.id} r={r} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function ReactionCard({ r }: { r: (typeof ELEMENTAL_REACTIONS)[number] }) {
  // Tên phản ứng Nguyệt/Tinh Vực tô màu theo nguyên tố ĐẶC TRƯNG của
  // biến thể đó (accentElement) — vd Nguyệt-Điện Cảm màu tím (Lôi),
  // Nguyệt-Sum Suê màu xanh lá (Thảo), Nguyệt-Kết Tinh màu vàng (Nham) —
  // thay vì tất cả cùng 1 màu xanh dương/tím cố định như trước.
  const titleColor = r.accentElement ? elementColor(r.accentElement) : undefined;

  return (
    <div className="relic-frame bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <span className="font-display font-bold" style={titleColor ? { color: titleColor } : undefined}>
            {r.nameVi}
          </span>
          {r.nameVi !== r.name && <span className="text-muted text-xs ml-2">({r.name})</span>}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${CATEGORY_COLOR[r.category]}`}>
          {CATEGORY_LABEL[r.category]}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {r.elements.map((elName, i) => (
          <span key={elName} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted text-xs">+</span>}
            <ElementIcon vision={elName} iconUrl={ELEMENT_ICON_URLS[elName]} size={18} />
          </span>
        ))}
      </div>
      <p className="text-sm text-secondary mb-2">{r.description}</p>
      {r.requiresCharacters && (
        <div className="text-[11px] text-muted pt-2 border-t border-border/60">
          Nhân vật: {r.requiresCharacters}
        </div>
      )}
    </div>
  );
}

function ResonanceAndFactionPanel() {
  return (
    <div className="space-y-8">
      {/* Cộng hưởng Nguyên tố */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">Cộng hưởng Nguyên tố</h3>
        <p className="text-xs text-muted mb-3">Có ≥2 nhân vật cùng nguyên tố trong 4 vị trí đầu đội hình. Nhiều hơn 2 không cộng dồn thêm.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ELEMENTAL_RESONANCES.map((res) => (
            <div key={res.id} className="relic-frame bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <ElementIcon vision={res.element} iconUrl={ELEMENT_ICON_URLS[res.element]} size={18} />
                <span className="font-semibold text-primary text-sm">{res.nameVi}</span>
              </div>
              <p className="text-xs text-secondary">{res.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cộng hưởng Nguyệt */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{LUNAR_RESONANCE.nameVi}</h3>
        <p className="text-xs text-muted mb-1">{LUNAR_RESONANCE.requirement}</p>
        <p className="text-sm text-secondary mb-3">{LUNAR_RESONANCE.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LUNAR_RESONANCE.scalings.map((s, i) => (
            <div key={i} className="relic-frame bg-card border border-border rounded-lg p-3 text-sm">
              <div className="flex items-center gap-1.5 mb-1">
                {s.elements.map((elName) => (
                  <ElementIcon key={elName} vision={elName} iconUrl={ELEMENT_ICON_URLS[elName]} size={16} />
                ))}
              </div>
              <div className="text-secondary mb-1">{s.statLabel}: <span className="text-gold-bright font-medium">{s.ratePerUnit}</span></div>
              <div className="text-[11px] text-muted italic">VD: {s.example}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-2">Tối đa {LUNAR_RESONANCE.maxBonus} mỗi lần kích hoạt · Ra mắt bản {LUNAR_RESONANCE.gameVersion}</p>
      </div>

      {/* Hexerei */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{HEXEREI_INFO.nameVi}</h3>
        <p className="text-xs text-muted mb-1">{HEXEREI_INFO.requirement}</p>
        <p className="text-sm text-secondary mb-3">{HEXEREI_INFO.description}</p>
        <CharacterGroup label="Sóng 1 (bản 6.2)" names={HEXEREI_WAVE_1} />
        <CharacterGroup label="Sóng 2 (bản 6.6)" names={HEXEREI_WAVE_2} />
        <CharacterGroup label="Witch mới, có sẵn Hexerei (bản 6.6)" names={HEXEREI_NEW_WITCHES} />
      </div>

      {/* Khải Huyền Của Ma Nữ (Witch's Revelation) */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{WITCH_REVELATION_INFO.nameVi}</h3>
        <p className="text-xs text-muted mb-1">{WITCH_REVELATION_INFO.requirement}</p>
        <p className="text-sm text-secondary mb-3">{WITCH_REVELATION_INFO.description}</p>
        <CharacterGroup label={`Bản ${WITCH_REVELATION_INFO.gameVersion}`} names={WITCH_REVELATION_CHARACTERS} color="fuchsia" />
        <p className="text-[11px] text-muted mt-2">
          Lưu ý: KHÁC với Hexerei ở trên dù tên na ná — cơ chế này gắn với phản ứng Stellar-Conduct (xem tab "Tinh Vực"), không phải buff phe phái Mondstadt.
        </p>
      </div>
    </div>
  );
}

function CharacterGroup({ label, names, color = "purple" }: { label: string; names: readonly string[]; color?: "purple" | "fuchsia" }) {
  const colorClass = color === "fuchsia"
    ? "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300"
    : "border-purple-500/50 bg-purple-500/10 text-purple-300";
  return (
    <div className="mb-3">
      <div className="text-[11px] text-muted mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <span key={name} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${colorClass}`}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}