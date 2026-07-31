"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
 * Ô tìm kiếm trên header — gợi ý trực tiếp (autocomplete) qua /api/search
 * thay vì chỉ submit-and-reload như trước. Debounce 250ms để không gọi API
 * mỗi phím gõ, và bỏ qua request cũ nếu người dùng đã gõ tiếp (tránh
 * "race condition" hiển thị kết quả lỗi thời khi request trước về sau).
 */
export function SearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchApiData | null>(null);

  useEffect(() => {
    const query = value.trim();
    abortRef.current?.abort();

    if (query.length < MIN_QUERY_LENGTH) {
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

  // Đóng dropdown khi click ra ngoài.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (e.key === "Escape") setOpen(false);
  }

  const hasResults = !!data && data.total > 0;
  const showDropdown = open && value.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xs ml-auto">
      <form onSubmit={handleSubmit}>
        <input
          type="search"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Tìm nhân vật, vũ khí, thánh di vật..."
          aria-label="Tìm kiếm"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-[color:var(--gold)]/50 transition-colors"
        />
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-neutral-800 bg-neutral-900 shadow-xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {loading && !data && (
            <div className="px-3 py-3 text-xs text-neutral-500">Đang tìm...</div>
          )}

          {!loading && data && !hasResults && (
            <div className="px-3 py-3 text-xs text-neutral-500">
              Không tìm thấy kết quả cho &ldquo;{value.trim()}&rdquo;
            </div>
          )}

          {hasResults && (
            <>
              <SuggestionGroup title="Nhân vật" items={data!.characters} basePath="/characters" onNavigate={() => setOpen(false)} />
              <SuggestionGroup title="Vũ khí" items={data!.weapons} basePath="/weapons" onNavigate={() => setOpen(false)} />
              <SuggestionGroup title="Thánh di vật" items={data!.artifacts} basePath="/artifacts" onNavigate={() => setOpen(false)} />

              <button
                type="button"
                onClick={goToSearchPage}
                className="w-full text-left px-3 py-2.5 text-xs text-gold-bright hover:bg-neutral-800 transition-colors border-t border-neutral-800"
              >
                Xem tất cả {data!.total} kết quả cho &ldquo;{value.trim()}&rdquo; →
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
      <div className="px-3 pt-1.5 pb-1 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
        {title}
      </div>
      {items.map((item) => (
        <Link
          key={item.id}
          href={`${basePath}/${item.id}`}
          onClick={onNavigate}
          className="flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-800 transition-colors"
        >
          <span className="relative w-7 h-7 shrink-0 rounded bg-neutral-800 overflow-hidden">
            {item.iconUrl && (
              <Image src={item.iconUrl} alt={item.name} fill sizes="28px" className="object-cover" />
            )}
          </span>
          <span className="text-sm text-neutral-200 truncate">{item.name}</span>
        </Link>
      ))}
    </div>
  );
}