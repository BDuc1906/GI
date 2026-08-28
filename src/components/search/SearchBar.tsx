"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

interface SearchResultItem {
  id: string;
  name: string;
  iconUrl: string | null;
}

interface SearchApiData {
  query: string;
  total: number;
  characters: SearchResultItem[];
  weapons: SearchResultItem[];
  artifacts: SearchResultItem[];
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;
const SUGGESTIONS_PER_TYPE = 4;

/**
 * Ô tìm kiếm trên header — mặc định thu gọn thành icon (nhất quán với
 * LanguageSwitcher), bấm vào mới bung ra ô nhập + gợi ý trực tiếp
 * (autocomplete) qua /api/search. Tự thu lại khi click ra ngoài hoặc
 * nhấn Esc nếu ô đang trống (không mất chữ đang gõ dở).
 */
export function SearchBar() {
  const t = useTranslations("SearchWidget");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchApiData | null>(null);

  useEffect(() => {
    const query = value.trim();
    abortRef.current?.abort();

    if (query.length < MIN_QUERY_LENGTH) {
      // reset state khi query quá ngắn, nhánh thoát sớm của effect
      // debounce fetch, không phải setState đồng bộ không điều kiện.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=${SUGGESTIONS_PER_TYPE}`,
          { signal: controller.signal }
        );
        const body = await res.json();
        if (body.success) setData(body.data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error("Search suggestion failed:", err);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  // Đóng dropdown + thu icon lại khi click ra ngoài (chỉ thu icon nếu ô
  // đang trống, tránh mất chữ người dùng gõ dở khi họ vô tình click ra
  // ngoài panel gợi ý).
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!value.trim()) setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  function openSearch() {
    setExpanded(true);
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function goToSearchPage() {
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    goToSearchPage();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      if (!value.trim()) setExpanded(false);
    }
  }

  const hasResults = !!data && data.total > 0;
  const showDropdown = expanded && open && value.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="relative">
      {!expanded ? (
        <button
          type="button"
          onClick={openSearch}
          aria-label={t("ariaSearch")}
          title={t("searchShortcutTitle")}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-text-secondary hover:border-gold hover:text-text-primary transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="relative w-56 md:w-64">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={t("placeholder")}
            aria-label={t("ariaSearch")}
            className="w-full rounded-lg border border-border bg-[color:var(--bg-input)] pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[color:var(--gold)]/50 transition-colors"
          />
        </form>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-border bg-bg-card shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {loading && !data && (
            <div className="px-3 py-3 text-xs text-text-muted">{t("searching")}</div>
          )}

          {!loading && data && !hasResults && (
            <div className="px-3 py-3 text-xs text-text-muted">
              {t("noResultsFor", { query: value.trim() })}
            </div>
          )}

          {hasResults && (
            <>
              <SuggestionGroup title={t("sectionCharacters")} items={data!.characters} basePath="/characters" onNavigate={() => setOpen(false)} />
              <SuggestionGroup title={t("sectionWeapons")} items={data!.weapons} basePath="/weapons" onNavigate={() => setOpen(false)} />
              <SuggestionGroup title={t("sectionArtifacts")} items={data!.artifacts} basePath="/artifacts" onNavigate={() => setOpen(false)} />

              <button
                type="button"
                onClick={goToSearchPage}
                className="w-full text-left px-3 py-2.5 text-xs text-[color:var(--gold-bright)] hover:bg-[color:var(--bg-table-alt)] transition-colors border-t border-border"
              >
                {t("viewAllResults", { count: data!.total, query: value.trim() })} →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionGroup({
  title,
  items,
  basePath,
  onNavigate,
}: {
  title: string;
  items: SearchResultItem[];
  basePath: string;
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="py-1">
      <div className="px-3 pt-1.5 pb-1 text-[10px] uppercase tracking-wider text-text-muted font-semibold">
        {title}
      </div>
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${basePath}/${item.id}`}
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-2 hover:bg-[color:var(--bg-table-alt)] transition-colors"
        >
          <span className="relative w-7 h-7 shrink-0 rounded bg-[color:var(--bg-table-alt)] overflow-hidden">
            {item.iconUrl && (
              <Image src={item.iconUrl} alt={item.name} fill sizes="28px" className="object-cover" />
            )}
          </span>
          <span className="text-sm text-text-primary truncate">{item.name}</span>
        </Link>
      ))}
    </div>
  );
}
