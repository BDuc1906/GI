"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { ElementIcon } from "../character/ElementIcon";
import { rarityStars, elementColorVar, rarityColorVar } from "@/lib/ui/theme";

interface SearchCharacter {
  id: string;
  name: string;
  vision: string;
  weaponType: string;
  rarity: number;
  iconUrl: string | null;
  elementIcon: string | null;
}
interface SearchWeapon {
  id: string;
  name: string;
  type: string;
  rarity: number;
  iconUrl: string | null;
}
interface SearchArtifact {
  id: string;
  name: string;
  rarityRange: number[];
  iconUrl: string | null;
}
interface SearchDomain {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
}

interface SearchData {
  total: number;
  characters: SearchCharacter[];
  weapons: SearchWeapon[];
  artifacts: SearchArtifact[];
  domains: SearchDomain[];
}

const EMPTY: SearchData = { total: 0, characters: [], weapons: [], artifacts: [], domains: [] };

/**
 * Cmd/Ctrl+K mở modal tìm kiếm nổi — không cần cuộn lên đầu trang bấm vào
 * ô search như trước. Dùng chung API /api/search đã có sẵn (4 loại tài
 * nguyên trong 1 lần gọi), chỉ thêm lớp UI + phím tắt.
 *
 * Đóng bằng: Esc, click ra ngoài panel, hoặc chọn 1 kết quả (điều hướng
 * qua <Link>, không cần gọi router.push thủ công).
 */
export function CommandPalette() {
  const t = useTranslations("SearchWidget");
  const tWeaponType = useTranslations("WeaponType");
  const tDomains = useTranslations("Domains");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchData>(EMPTY);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setData(EMPTY);
  }, []);

  // Phím tắt toàn cục: Cmd/Ctrl+K mở, Esc đóng. Bỏ qua khi người dùng
  // đang gõ trong 1 input/textarea khác (tránh chặn ký tự "k" bình thường).
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Debounce 250ms — tránh gọi API mỗi keystroke.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      // reset state khi query rỗng, nhánh thoát sớm của effect debounce
      // fetch, không phải setState đồng bộ không điều kiện ở toàn bộ effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=6`);
        const body = await res.json();
        if (body?.success) setData(body.data as SearchData);
      } catch {
        // Lỗi mạng: giữ nguyên kết quả cũ, không làm gián đoạn palette.
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, open]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) close();
  }

  if (!open) return null;

  const hasResults = data.total > 0;
  const trimmedQuery = query.trim();
  const domainCategoryLabel: Record<string, string> = {
    artifact: tDomains("categoryArtifact"),
    weapon: tDomains("categoryWeapon"),
    talent: tDomains("categoryTalent"),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("ariaSearch")}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/60 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        className="surface-card w-full max-w-lg border border-border-strong rounded-xl overflow-hidden shadow-md"
      >
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("palettePlaceholder")}
            className="flex-1 bg-transparent border-none py-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
          <kbd className="hidden sm:inline text-[10px] text-text-muted border border-border rounded px-1.5 py-0.5 shrink-0">
            Esc
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {!trimmedQuery && (
            <div className="px-4 py-8 text-center text-xs text-text-muted">
              {t("paletteHintPrefix")} <kbd className="border border-border rounded px-1 py-0.5">Esc</kbd> {t("paletteHintSuffix")}
            </div>
          )}

          {trimmedQuery && loading && (
            <div className="px-4 py-8 text-center text-xs text-text-muted">{t("searching")}</div>
          )}

          {trimmedQuery && !loading && !hasResults && (
            <div className="px-4 py-8 text-center text-xs text-text-muted">
              {t("noResultsForDot", { query: trimmedQuery })}
            </div>
          )}

          {trimmedQuery && !loading && hasResults && (
            <div className="py-2">
              {data.characters.length > 0 && (
                <ResultGroup label={t("sectionCharacters")}>
                  {data.characters.map((c) => (
                    <ResultRow
                      key={c.id}
                      href={`/characters/${c.id}`}
                      onNavigate={close}
                      name={c.name}
                      iconUrl={c.iconUrl}
                      elementColor={elementColorVar(c.vision)}
                      meta={
                        <>
                          <ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={12} />
                          <span>{tWeaponType(c.weaponType)}</span>
                        </>
                      }
                      rarity={c.rarity}
                    />
                  ))}
                </ResultGroup>
              )}

              {data.weapons.length > 0 && (
                <ResultGroup label={t("sectionWeapons")}>
                  {data.weapons.map((w) => (
                    <ResultRow
                      key={w.id}
                      href={`/weapons/${w.id}`}
                      onNavigate={close}
                      name={w.name}
                      iconUrl={w.iconUrl}
                      elementColor={rarityColorVar(w.rarity)}
                      meta={<span>{tWeaponType(w.type)}</span>}
                      rarity={w.rarity}
                    />
                  ))}
                </ResultGroup>
              )}

              {data.artifacts.length > 0 && (
                <ResultGroup label={t("sectionArtifacts")}>
                  {data.artifacts.map((a) => (
                    <ResultRow
                      key={a.id}
                      href={`/artifacts/${a.id}`}
                      onNavigate={close}
                      name={a.name}
                      iconUrl={a.iconUrl}
                      elementColor={rarityColorVar(Math.max(...a.rarityRange, 4))}
                      meta={<span>{a.rarityRange.join("–")}★</span>}
                    />
                  ))}
                </ResultGroup>
              )}

              {data.domains.length > 0 && (
                <ResultGroup label={t("sectionDomains")}>
                  {data.domains.map((d) => (
                    <ResultRow
                      key={d.id}
                      href={`/domains/${d.id}`}
                      onNavigate={close}
                      name={d.name}
                      iconUrl={d.imageUrl}
                      meta={<span>{domainCategoryLabel[d.category] ?? d.category}</span>}
                    />
                  ))}
                </ResultGroup>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1 last:mb-0">
      <div className="px-4 py-1.5 text-eyebrow">{label}</div>
      <div>{children}</div>
    </div>
  );
}

function ResultRow({
  href,
  onNavigate,
  name,
  iconUrl,
  meta,
  rarity,
  elementColor,
}: {
  href: string;
  onNavigate: () => void;
  name: string;
  iconUrl: string | null;
  meta: React.ReactNode;
  rarity?: number;
  elementColor?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 px-4 py-2 hover:bg-bg-elevated transition-colors"
    >
      <div
        className="relative w-8 h-8 rounded-md bg-bg-elevated shrink-0 overflow-hidden"
        style={elementColor ? { border: `1px solid color-mix(in srgb, ${elementColor} 40%, var(--border-color))` } : undefined}
      >
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconUrl} alt="" className="w-full h-full object-contain p-1" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm text-text-primary truncate">{name}</div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">{meta}</div>
      </div>
      {rarity !== undefined && (
        <span className="text-[10px] text-text-muted tracking-tight shrink-0">{rarityStars(rarity)}</span>
      )}
    </Link>
  );
}
