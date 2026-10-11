"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { EntityThumb } from "@/components/ui/EntityThumb";
import {
  TEAM_SIZE,
  suggestTeams,
  type ReactionRule,
  type ResonanceRule,
  type TeamChar,
} from "@/core/game/team-synergy";

export interface BuilderChar extends TeamChar {
  /** Tên hiển thị theo ngôn ngữ đang chọn. */
  label: string;
  /** URL ảnh theo thứ tự thử. */
  icons: string[];
}

export interface TeamBuilderProps {
  characters: BuilderChar[];
  reactions: ReactionRule[];
  resonances: ResonanceRule[];
  names: {
    reactions: Record<string, string>;
    resonances: Record<string, string>;
    elements: Record<string, string>;
  };
  /** Các phản ứng có thể chọn làm trọng tâm. */
  focusOptions: Array<{ id: string; name: string }>;
  initialPinned: string[];
  initialFocus: string;
}

const STORAGE_KEY = "leibo:team-builder:v1";
const ELEMENT_ORDER = ["Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"];

const chip = (active: boolean) =>
  `px-3 py-1 rounded-full border text-sm transition-colors ${
    active
      ? "bg-bg-elevated border-accent-500 text-accent-bright font-semibold"
      : "border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
  }`;

const smallBtn = (active: boolean) =>
  `flex-1 px-2 py-1 rounded-md border text-xs transition-colors ${
    active
      ? "bg-bg-elevated border-accent-500 text-accent-bright font-semibold"
      : "border-border text-text-muted hover:border-accent-500 hover:text-accent-bright"
  }`;

export function TeamBuilderClient({
  characters,
  reactions,
  resonances,
  names,
  focusOptions,
  initialPinned,
  initialFocus,
}: TeamBuilderProps) {
  const byId = useMemo(() => new Map(characters.map((c) => [c.id, c])), [characters]);
  const [owned, setOwned] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string[]>(initialPinned);
  const [focus, setFocus] = useState(initialFocus);
  const [query, setQuery] = useState("");
  const [elementFilter, setElementFilter] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Nạp danh sách "tôi có" đã lưu (chỉ lưu trong trình duyệt của người dùng, không gửi lên máy chủ).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { owned?: unknown };
        if (Array.isArray(saved.owned)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setOwned(saved.owned.filter((id): id is string => typeof id === "string" && byId.has(id)));
        }
      }
    } catch {
      /* localStorage bị chặn hoặc dữ liệu hỏng: bỏ qua, dùng danh sách trống */
    }
    setLoaded(true);
  }, [byId]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ owned }));
    } catch {
      /* bỏ qua */
    }
  }, [owned, loaded]);

  const ownedSet = useMemo(() => new Set(owned), [owned]);
  const pinnedSet = useMemo(() => new Set(pinned), [pinned]);

  const toggleOwned = (id: string) =>
    setOwned((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const togglePin = (id: string) =>
    setPinned((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= TEAM_SIZE ? cur : [...cur, id]));

  const q = query.trim().toLowerCase();
  const visible = characters.filter(
    (c) =>
      (!elementFilter || c.element === elementFilter) &&
      (!q || c.label.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
  );

  const pool = owned.length > 0 ? characters.filter((c) => ownedSet.has(c.id)) : characters;
  const pinnedChars = pinned.flatMap((id) => (byId.has(id) ? [byId.get(id) as BuilderChar] : []));

  const result = useMemo(
    () =>
      suggestTeams({
        pool,
        pinned: pinnedChars,
        universe: characters,
        reactions,
        resonances,
        focus: focus || undefined,
        limit: 6,
      }),
    // pool/pinnedChars được dựng lại mỗi lần render nên phụ thuộc vào dữ liệu gốc của chúng.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [owned, pinned, focus, characters, reactions, resonances]
  );

  const focusRule = focus ? reactions.find((r) => r.id === focus) : undefined;
  const elLabel = (e: string) => names.elements[e] ?? e;

  return (
    <div className="space-y-10">
      {/* Giải thích phương pháp và giới hạn — phải đọc trước khi tin kết quả */}
      <div className="rounded-xl border border-border bg-bg-secondary p-4 text-sm text-text-secondary max-w-3xl space-y-1.5">
        <p>
          <strong className="text-text-primary">Đây là gợi ý theo cơ chế game, không phải &ldquo;đội mạnh nhất&rdquo;.</strong>{" "}
          Công cụ chỉ xét nguyên tố của từng nhân vật: những phản ứng nguyên tố mở được và cộng hưởng nguyên tố của đội.
        </p>
        <p>
          Dữ liệu nguồn không có vai trò (DPS, hỗ trợ, hồi máu) hay thống kê người chơi, nên công cụ chưa biết ai hồi máu
          hay ai gây sát thương chính. Hãy <strong className="text-text-primary">ghim</strong> nhân vật bạn muốn giữ (ví dụ DPS
          chính và người hồi máu), công cụ sẽ lo các ô còn lại và đưa phương án thay thế.
        </p>
      </div>

      {/* Bước 1: chọn nhân vật */}
      <section aria-labelledby="tb-step1">
        <h2 id="tb-step1" className="font-display text-xl font-bold text-accent-bright border-b border-border pb-2 mb-3">
          1. Nhân vật bạn đang có
        </h2>
        <p className="text-sm text-text-muted mb-3">
          {owned.length > 0
            ? `Đang xét ${owned.length} nhân vật bạn đã chọn.`
            : "Chưa chọn nhân vật nào → công cụ xét tất cả nhân vật. Bấm \"Tôi có\" để giới hạn theo danh sách của bạn (lưu trong trình duyệt)."}
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhân vật..."
            aria-label="Tìm nhân vật"
            className="px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted w-56 max-w-full"
          />
          <button
            type="button"
            className={chip(false)}
            onClick={() => setOwned((cur) => Array.from(new Set([...cur, ...visible.map((c) => c.id)])))}
          >
            Chọn tất cả đang hiển thị
          </button>
          <button
            type="button"
            className={chip(false)}
            onClick={() => setOwned((cur) => cur.filter((id) => !visible.some((c) => c.id === id)))}
          >
            Bỏ chọn đang hiển thị
          </button>
          {owned.length > 0 && (
            <button type="button" className={chip(false)} onClick={() => setOwned([])}>
              Xoá danh sách của tôi
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4" aria-label="Lọc theo nguyên tố">
          <button type="button" className={chip(!elementFilter)} onClick={() => setElementFilter("")}>
            Mọi nguyên tố
          </button>
          {ELEMENT_ORDER.filter((e) => characters.some((c) => c.element === e)).map((e) => (
            <button key={e} type="button" className={chip(elementFilter === e)} onClick={() => setElementFilter(e)}>
              {elLabel(e)}
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {visible.map((c) => {
            const isOwned = ownedSet.has(c.id);
            const isPinned = pinnedSet.has(c.id);
            return (
              <li
                key={c.id}
                className={`rounded-xl border p-2 transition-colors ${
                  isPinned ? "border-accent-500 bg-bg-elevated" : isOwned ? "border-accent-500/50" : "border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <EntityThumb candidates={c.icons} alt={c.label} size="sm" round />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate" title={c.label}>
                      {c.label}
                    </div>
                    <div className="text-[11px] text-text-muted flex items-center gap-1">
                      <span
                        aria-hidden="true"
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: `var(--el-${c.element.toLowerCase()})` }}
                      />
                      {elLabel(c.element)} · {c.rarity}★
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button type="button" aria-pressed={isOwned} className={smallBtn(isOwned)} onClick={() => toggleOwned(c.id)}>
                    Tôi có
                  </button>
                  <button
                    type="button"
                    aria-pressed={isPinned}
                    className={smallBtn(isPinned)}
                    onClick={() => togglePin(c.id)}
                    title={isPinned || pinned.length < TEAM_SIZE ? "Ghim vào đội" : `Tối đa ${TEAM_SIZE} nhân vật`}
                  >
                    Ghim
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        {visible.length === 0 && <p className="text-sm text-text-muted">Không có nhân vật nào khớp.</p>}
      </section>

      {/* Bước 2: ghim + trọng tâm */}
      <section aria-labelledby="tb-step2">
        <h2 id="tb-step2" className="font-display text-xl font-bold text-accent-bright border-b border-border pb-2 mb-3">
          2. Đội cố định và trọng tâm
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4 min-h-9">
          {pinnedChars.length === 0 ? (
            <span className="text-sm text-text-muted">Chưa ghim ai — công cụ tự chọn cả 4 người.</span>
          ) : (
            pinnedChars.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-2 pr-1 rounded-full border border-accent-500/60 bg-bg-elevated text-sm text-text-primary">
                <EntityThumb candidates={c.icons} alt={c.label} size="sm" round className="!w-7 !h-7" />
                {c.label}
                <button
                  type="button"
                  onClick={() => togglePin(c.id)}
                  aria-label={`Bỏ ghim ${c.label}`}
                  className="px-2 text-text-muted hover:text-accent-bright"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        <label className="flex flex-col gap-1 text-xs text-text-muted max-w-sm">
          Trọng tâm phản ứng
          <select
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary text-sm"
          >
            <option value="">Phủ rộng — nhiều phản ứng và cộng hưởng nhất</option>
            {focusOptions.map((o) => (
              <option key={o.id} value={o.id}>
                Tập trung: {o.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Kết quả */}
      <section aria-labelledby="tb-results" aria-live="polite">
        <h2 id="tb-results" className="font-display text-xl font-bold text-accent-bright border-b border-border pb-2 mb-3">
          3. Đội hình gợi ý
        </h2>

        {result.teams.length === 0 ? (
          <p className="text-sm text-text-secondary">{result.note ?? "Chưa có gợi ý."}</p>
        ) : (
          <ol className="space-y-4">
            {result.teams.map((team, i) => {
              const contributors = focusRule
                ? team.slots.filter((s) => focusRule.elements.includes(s.character.element)).length
                : 0;
              return (
                <li key={i} className="rounded-2xl border-2 border-border bg-bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-text-primary">Đội #{i + 1}</h3>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full bg-bg-elevated text-accent-bright font-medium"
                      title={
                        focusRule
                          ? "Số thành viên có nguyên tố tham gia phản ứng đã chọn"
                          : "Điểm = 10 × số phản ứng + 6 × số cộng hưởng. Chỉ đo độ phủ cơ chế, không phải sức mạnh."
                      }
                    >
                      {focusRule
                        ? `${names.reactions[focusRule.id] ?? focusRule.id}: ${contributors}/${TEAM_SIZE} thành viên đóng góp`
                        : `Độ phủ cơ chế: ${team.score}`}
                    </span>
                  </div>

                  <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {team.slots.map((slot) => {
                      const c = byId.get(slot.character.id);
                      if (!c) return null;
                      return (
                        <li key={c.id} className="rounded-xl border border-border p-2">
                          <Link href={`/characters/${c.id}`} className="flex items-center gap-2 group">
                            <EntityThumb candidates={c.icons} alt={c.label} size="md" round />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-bright transition-colors">
                                {c.label}
                              </div>
                              <div className="text-[11px] text-text-muted">
                                {elLabel(c.element)} · {c.rarity}★{slot.pinned ? " · đã ghim" : ""}
                              </div>
                            </div>
                          </Link>
                          {slot.alternatives.length > 0 && (
                            <div className="mt-2">
                              <div className="text-[11px] text-text-muted mb-1">Thay thế (cùng nguyên tố):</div>
                              <ul className="flex flex-wrap gap-1">
                                {slot.alternatives.map((a) => {
                                  const alt = byId.get(a.id);
                                  if (!alt) return null;
                                  return (
                                    <li key={a.id}>
                                      <Link href={`/characters/${a.id}`} title={alt.label}>
                                        <EntityThumb candidates={alt.icons} alt={alt.label} size="sm" round className="!w-8 !h-8" />
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <dl className="text-sm space-y-1.5">
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      <dt className="text-text-muted">Cộng hưởng:</dt>
                      <dd className="text-text-secondary">
                        {team.resonances.length > 0
                          ? team.resonances.map((r) => names.resonances[r] ?? r).join(", ")
                          : "không có (cần 2 nhân vật cùng nguyên tố, hoặc đủ 4 nguyên tố khác nhau)"}
                      </dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-1">
                      <dt className="text-text-muted">Phản ứng mở được:</dt>
                      <dd className="text-text-secondary">
                        {team.reactions.length > 0
                          ? team.reactions.map((r) => names.reactions[r] ?? r).join(", ")
                          : "chưa có"}
                      </dd>
                    </div>
                    {team.lunar.length > 0 && (
                      <div className="flex flex-wrap gap-x-2 gap-y-1">
                        <dt className="text-text-muted">Phản ứng Lunar:</dt>
                        <dd className="text-text-secondary">
                          {team.lunar.map((r) => names.reactions[r] ?? r).join(", ")}{" "}
                          <span className="text-text-muted">(đội có nhân vật yêu cầu; không tính vào điểm)</span>
                        </dd>
                      </div>
                    )}
                  </dl>
                </li>
              );
            })}
          </ol>
        )}

        {result.hints.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-bg-secondary p-4">
            <h3 className="font-semibold text-text-primary mb-2">Nếu có thêm nhân vật</h3>
            <ul className="space-y-1 text-sm text-text-secondary">
              {result.hints.map((h) => (
                <li key={h.element}>
                  <strong className="text-text-primary">{elLabel(h.element)}</strong>: mở thêm{" "}
                  {[
                    ...h.newReactions.map((r) => names.reactions[r] ?? r),
                    ...h.newResonances.map((r) => names.resonances[r] ?? r),
                  ].join(", ") || "—"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
