"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

// ── localStorage helper (SSR-safe via useSyncExternalStore) ──────────────────
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function useLocalStorage<T>(key: string, fallback: T): [T, (v: T) => void] {
  const snap = useSyncExternalStore(
    subscribe,
    () => {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ?? null;
      } catch {
        return null;
      }
    },
    () => null
  );

  const value: T = snap !== null ? (JSON.parse(snap) as T) : fallback;

  const set = useCallback(
    (v: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(v));
        window.dispatchEvent(new Event("storage"));
      } catch {
        // ignore
      }
    },
    [key]
  );

  return [value, set];
}

// ── Types ────────────────────────────────────────────────────────────────────
interface CharacterOption {
  id: string;
  name: string;
  vision: string;
  weaponType: string;
  rarity: number;
  iconUrl: string | null;
}

interface WeaponOption {
  id: string;
  name: string;
  rarity: number;
  baseAtk: number | null;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ShowcaseCardGeneratorClient() {
  const [characters, setCharacters] = useState<CharacterOption[]>([]);
  const [weapons, setWeapons] = useState<WeaponOption[]>([]);

  const [selectedCharId, setSelectedCharId] = useState<string>("");
  const [level, setLevel] = useState<number>(90);
  const [constellations, setConstellations] = useState<number>(0);
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>("");

  const [loadingChars, setLoadingChars] = useState(true);
  const [loadingWeapons, setLoadingWeapons] = useState(false);
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ── Fetch characters on mount ────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    setLoadingChars(true);

    fetch("/api/characters?limit=200&sort=-rarity", { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCharacters(json.data as CharacterOption[]);
          if (json.data.length > 0) {
            setSelectedCharId((json.data[0] as CharacterOption).id);
          }
        }
      })
      .catch(() => {/* aborted or error */})
      .finally(() => setLoadingChars(false));

    return () => controller.abort();
  }, []);

  // ── Fetch weapons when character changes ─────────────────────────────────
  const selectedChar = characters.find((c) => c.id === selectedCharId) ?? null;

  useEffect(() => {
    if (!selectedChar) return;
    const controller = new AbortController();
    setLoadingWeapons(true);
    setSelectedWeaponId("");

    fetch(`/api/weapons?type=${selectedChar.weaponType}&limit=200&sort=-rarity`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const list = json.data as WeaponOption[];
          setWeapons(list);
          if (list.length > 0) setSelectedWeaponId(list[0].id);
        }
      })
      .catch(() => {/* aborted */})
      .finally(() => setLoadingWeapons(false));

    return () => controller.abort();
  }, [selectedChar?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Build preview URL ────────────────────────────────────────────────────
  const previewUrl = selectedCharId
    ? `/api/tools/showcase-card?characterId=${encodeURIComponent(selectedCharId)}&level=${level}&constellations=${constellations}${selectedWeaponId ? `&weapon=${encodeURIComponent(selectedWeaponId)}` : ""}`
    : "";

  // ── Share URL ─────────────────────────────────────────────────────────────
  const shareUrl =
    typeof window !== "undefined" && previewUrl
      ? `${window.location.origin}${previewUrl}`
      : "";

  // ── Download handler ──────────────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!previewUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const charName = selectedChar?.name ?? "showcase";
      a.download = `leibo-showcase-${charName.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [previewUrl, selectedChar]);

  // ── Copy link handler ─────────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
    } finally {
      setTimeout(() => setCopying(false), 1500);
    }
  }, [shareUrl]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Left panel: controls ─────────────────────────────────────────── */}
      <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
        {/* Character selector */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Nhân vật
          </label>
          {loadingChars ? (
            <div className="h-10 rounded-lg bg-bg-elevated animate-pulse" />
          ) : (
            <select
              value={selectedCharId}
              onChange={(e) => setSelectedCharId(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {characters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {"★".repeat(c.rarity)} ({c.vision})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Level slider */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            <span>Level</span>
            <span className="text-text-primary text-base font-bold">{level}</span>
          </label>
          <input
            type="range"
            min={1}
            max={90}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>1</span><span>90</span>
          </div>
        </div>

        {/* Constellation slider */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            <span>Constellation</span>
            <span className="text-purple-400 text-base font-bold">C{constellations}</span>
          </label>
          <input
            type="range"
            min={0}
            max={6}
            value={constellations}
            onChange={(e) => setConstellations(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-text-muted mt-1">
            <span>C0</span><span>C6</span>
          </div>
        </div>

        {/* Weapon selector */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            Vũ khí{" "}
            {selectedChar && (
              <span className="normal-case font-normal text-text-muted">
                ({selectedChar.weaponType})
              </span>
            )}
          </label>
          {loadingWeapons ? (
            <div className="h-10 rounded-lg bg-bg-elevated animate-pulse" />
          ) : (
            <select
              value={selectedWeaponId}
              onChange={(e) => setSelectedWeaponId(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-elevated text-text-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="">(Không chọn)</option>
              {weapons.map((w) => (
                <option key={w.id} value={w.id}>
                  {"★".repeat(w.rarity)} {w.name}
                  {w.baseAtk !== null ? ` — Base ATK ${Math.round(w.baseAtk)}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleDownload}
            disabled={!previewUrl || downloading}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 text-sm transition-colors"
          >
            {downloading ? (
              <>
                <span className="animate-spin">⏳</span> Đang tải…
              </>
            ) : (
              <>⬇ Tải xuống PNG</>
            )}
          </button>

          <button
            onClick={handleCopy}
            disabled={!shareUrl}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-border hover:border-amber-500/50 bg-bg-elevated hover:bg-bg-card disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-semibold py-2.5 px-4 text-sm transition-colors"
          >
            {copying ? "✅ Đã copy!" : "🔗 Copy link chia sẻ"}
          </button>
        </div>
      </div>

      {/* ── Right panel: preview ──────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
          Preview (1200×630)
        </p>
        <div className="relative w-full rounded-xl overflow-hidden border border-border bg-bg-elevated">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Showcase card preview"
              className="w-full h-auto"
              style={{ aspectRatio: "1200/630", objectFit: "cover" }}
            />
          ) : (
            <div
              className="flex items-center justify-center text-text-muted text-sm"
              style={{ aspectRatio: "1200/630" }}
            >
              Chọn nhân vật để xem preview
            </div>
          )}
        </div>
        <p className="text-xs text-text-muted mt-2">
          Ảnh sẽ được tạo trực tiếp từ server (Next.js OG Image).
        </p>
      </div>
    </div>
  );
}
