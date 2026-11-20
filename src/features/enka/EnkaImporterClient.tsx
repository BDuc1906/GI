"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
import type {
  EnkaShowcaseResult,
  EnkaShowcaseCharacter,
  RecentUid,
} from "./types";
import { CharacterDetailModal } from "./components/CharacterDetailModal";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";

const STORAGE_KEY = "leibo-enka-last-uid";
const RECENT_UIDS_KEY = "leibo-enka-recent-uids";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getSnapshotFactory(key: string) {
  return () => {
    try {
      return window.localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  };
}

function getServerSnapshot() {
  return "";
}

function useLocalStorageValue(key: string) {
  return useSyncExternalStore(subscribe, getSnapshotFactory(key), getServerSnapshot);
}

function setLocalStorageValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    window.dispatchEvent(new StorageEvent("storage", { key, newValue: value }));
  } catch {
    // ignore
  }
}

let cachedRecentRaw: string | null = null;
let cachedRecentList: RecentUid[] = [];

function getStoredRecentUids(): RecentUid[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_UIDS_KEY);
    if (raw === cachedRecentRaw) return cachedRecentList;
    cachedRecentRaw = raw;
    cachedRecentList = raw ? (JSON.parse(raw) as RecentUid[]) : [];
    return cachedRecentList;
  } catch {
    return [];
  }
}

function getServerRecentUids(): RecentUid[] {
  return [];
}

function saveRecentUid(entry: RecentUid) {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredRecentUids().filter((item) => item.uid !== entry.uid);
    const updated = [entry, ...list].slice(0, 5);
    window.localStorage.setItem(RECENT_UIDS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent("storage", { key: RECENT_UIDS_KEY }));
  } catch {
    // ignore
  }
}

function removeRecentUid(targetUid: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getStoredRecentUids().filter((item) => item.uid !== targetUid);
    window.localStorage.setItem(RECENT_UIDS_KEY, JSON.stringify(list));
    window.dispatchEvent(new StorageEvent("storage", { key: RECENT_UIDS_KEY }));
  } catch {
    // ignore
  }
}

export function detectGenshinServer(uid: string): { name: string; region: string; badgeColor: string } | null {
  const clean = uid.trim();
  if (!clean) return null;

  if (clean.startsWith("8") || clean.startsWith("18")) {
    return { name: "Châu Á (Asia)", region: "Asia", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  }
  if (clean.startsWith("6")) {
    return { name: "Bắc Mỹ (America)", region: "NA", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
  }
  if (clean.startsWith("7")) {
    return { name: "Châu Âu (Europe)", region: "EU", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30" };
  }
  if (clean.startsWith("9")) {
    return { name: "TW / HK / MO", region: "SAR", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
  }
  if (clean.startsWith("1") || clean.startsWith("2") || clean.startsWith("5")) {
    return { name: "Trung Quốc (China)", region: "CN", badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
  }
  return { name: "Máy chủ Teyvat", region: "Unknown", badgeColor: "bg-gray-500/10 text-gray-400 border-gray-500/30" };
}

interface EnkaImporterClientProps {
  onUseBuild?: (char: EnkaShowcaseCharacter) => void;
}

export function EnkaImporterClient({ onUseBuild }: EnkaImporterClientProps) {
  const router = useRouter();
  const savedUid = useLocalStorageValue(STORAGE_KEY);
  const recentUids = useSyncExternalStore(subscribe, getStoredRecentUids, getServerRecentUids);

  const [uid, setUid] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleWarning, setStaleWarning] = useState<string | null>(null);
  const [result, setResult] = useState<EnkaShowcaseResult | null>(null);
  const [resultUid, setResultUid] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(0);

  // Selected character for detailed view & build analysis modal
  const [selectedCharacter, setSelectedCharacter] = useState<EnkaShowcaseCharacter | null>(null);

  // Khởi tạo UID từ localStorage
  useEffect(() => {
    if (savedUid && !uid) {
      setUid(savedUid);
    }
  }, [savedUid, uid]);

  // Cooldown timer cho nút Refresh
  useEffect(() => {
    if (refreshCooldown <= 0) return;
    const timer = setInterval(() => {
      setRefreshCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [refreshCooldown]);

  const liveServer = detectGenshinServer(uid);

  function validateUid(val: string): string | null {
    if (!/^\d+$/.test(val)) return "UID chỉ được chứa các chữ số.";
    if (val.length < 9 || val.length > 10) return "UID Genshin Impact phải gồm đúng 9 hoặc 10 chữ số.";
    return null;
  }

  const handleSync = useCallback(
    async (targetUid?: string, isRefresh = false) => {
      const rawUid = (targetUid ?? uid).trim();
      const validationError = validateUid(rawUid);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (targetUid && targetUid !== uid) {
        setUid(targetUid);
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setError(null);
      }
      setStaleWarning(null);

      try {
        const resp = await fetch(`/api/tools/enka/${rawUid}`);
        const json = (await resp.json()) as
          | { success: true; data: EnkaShowcaseResult }
          | { success: false; error: { code: string; message: string } };

        if (!json.success) {
          if (result && isRefresh) {
            // Giữ lại dữ liệu cũ khi refresh thất bại (Stale data protection)
            setStaleWarning(`Không thể làm mới: ${json.error.message}. Đang hiển thị bản lưu trước đó.`);
          } else {
            setError(json.error.message);
          }
          return;
        }

        setResult(json.data);
        setResultUid(rawUid);
        setLocalStorageValue(STORAGE_KEY, rawUid);
        setRefreshCooldown(30); // 30s cooldown

        saveRecentUid({
          uid: rawUid,
          nickname: json.data.playerInfo.nickname || "Nhà Lữ Hành",
          arLevel: json.data.playerInfo.arLevel || 1,
          worldLevel: json.data.playerInfo.worldLevel || 0,
          avatarCount: json.data.showcaseCharacters.length,
          syncedAt: Date.now(),
        });
      } catch {
        if (result && isRefresh) {
          setStaleWarning("Lỗi kết nối máy chủ Enka, đang hiển thị dữ liệu đã lưu gần nhất.");
        } else {
          setError("Lỗi kết nối mạng hoặc máy chủ game, vui lòng thử lại sau.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [uid, result]
  );

  // Tự động fetch nếu có param ?uid=...
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const queryUid = urlParams.get("uid");
    if (queryUid && /^\d{9,10}$/.test(queryUid)) {
      const timer = setTimeout(() => {
        void handleSync(queryUid);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [handleSync]);

  const handleCopyUid = () => {
    if (!resultUid || typeof window === "undefined") return;
    void navigator.clipboard.writeText(resultUid).then(() => {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    });
  };

  const handleCopyLink = () => {
    if (!resultUid || typeof window === "undefined") return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?uid=${resultUid}`;
    void navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  function handleUseBuild(char: EnkaShowcaseCharacter) {
    if (onUseBuild) {
      onUseBuild(char);
      return;
    }
    const params = new URLSearchParams({
      source: "enka",
      characterId: char.characterId ?? "",
      characterLevel: String(char.level),
      weaponLevel: String(char.weapon?.level ?? 90),
      weaponRefinement: String(char.weapon?.refinement ?? 1),
      weaponIconKey: char.weapon?.iconKey ?? "",
      normalTalent: String(char.talentLevels[0] ?? 10),
      skillTalent: String(char.talentLevels[1] ?? 10),
      burstTalent: String(char.talentLevels[2] ?? 10),
      hp: String(char.fightProps.hp),
      atk: String(char.fightProps.atk),
      def: String(char.fightProps.def),
      critRate: String(char.fightProps.critRate),
      critDmg: String(char.fightProps.critDmg),
      em: String(char.fightProps.em),
      er: String(char.fightProps.er),
      damageBonus: String(char.fightProps.damageBonus),
    });
    router.push(`/tools/dps-calculator?${params.toString()}`);
  }

  const pInfo = result?.playerInfo;
  const serverInfo = resultUid ? detectGenshinServer(resultUid) : null;

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. INPUT & SERVER DETECTION BAR
          ========================================================================= */}
      <div className="rounded-3xl border border-border bg-bg-card p-6 md:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
              Tra Cứu Hồ Sơ &amp; Showcase Nhân Vật
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Nhập 9 hoặc 10 chữ số UID in-game để tải thông tin hồ sơ, thánh di vật và đối chiếu với build chuẩn KQM.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-border hover:border-amber-500/50 bg-bg-elevated text-text-secondary hover:text-amber-400 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>💡</span>
            <span>{showGuide ? "Đóng hướng dẫn" : "Hướng dẫn mở Showcase"}</span>
          </button>
        </div>

        {/* Collapsible Guide */}
        {showGuide && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3 text-xs leading-relaxed">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
              <span>📌</span> Hướng dẫn mở hiển thị chi tiết trong game Genshin Impact:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-text-secondary">
              <li>Mở Menu Paimon (phím Esc trên PC hoặc chạm góc trên bên trái).</li>
              <li>Bấm vào biểu tượng cây bút cạnh Nickname và chọn <strong>Sửa Hồ Sơ</strong>.</li>
              <li>Chọn mục <strong>Trưng bày nhân vật</strong> và thêm tối đa 8 nhân vật muốn soi trang bị.</li>
              <li>
                <strong className="text-amber-300">Bắt buộc:</strong> Gạt BẬT công tắc{" "}
                <strong className="text-amber-200">&quot;Hiển thị chi tiết nhân vật&quot;</strong> ở góc dưới bên trái màn hình.
              </li>
            </ol>
            <p className="text-[11px] text-text-muted italic pt-1">
              * Sau khi lưu trong game, vui lòng đợi 1–2 phút để server HoYoverse cập nhật dữ liệu ra ngoài.
            </p>
          </div>
        )}

        {/* Input box with live server badge */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{9,10}"
                maxLength={10}
                value={uid}
                onChange={(e) => {
                  setUid(e.target.value.replace(/\D/g, ""));
                  setError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && void handleSync()}
                placeholder="Nhập UID Genshin (ví dụ: 800000001)"
                className="w-full px-4 py-3 rounded-2xl border border-border bg-bg-elevated text-text-primary placeholder:text-text-muted font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-colors shadow-inner"
              />
              {uid && (
                <button
                  type="button"
                  onClick={() => {
                    setUid("");
                    setError(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => void handleSync()}
              disabled={loading || uid.length < 9 || uid.length > 10}
              className="px-6 py-3 rounded-2xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang tải dữ liệu…</span>
                </>
              ) : (
                <span>Tra cứu Player Profile</span>
              )}
            </button>
          </div>

          {/* Live Server Indicator under input */}
          {liveServer && uid.length > 0 && (
            <div className="flex items-center gap-2 text-xs pt-0.5">
              <span className="text-text-muted">Máy chủ nhận diện:</span>
              <span className={`px-2 py-0.5 rounded-md font-semibold border ${liveServer.badgeColor}`}>
                {liveServer.name}
              </span>
            </div>
          )}
        </div>

        {/* Recent UIDs Chips */}
        {recentUids.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/50 text-xs">
            <span className="text-text-muted">UID gần đây:</span>
            {recentUids.map((r) => (
              <div
                key={r.uid}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-bg-elevated border border-border hover:border-accent-500/50 transition-colors group"
              >
                <button
                  type="button"
                  onClick={() => void handleSync(r.uid)}
                  className="text-text-primary hover:text-accent-bright font-mono font-medium flex items-center gap-1"
                  title={`Tra cứu ${r.nickname} (AR ${r.arLevel})`}
                >
                  <span>{r.nickname}</span>
                  <span className="text-[10px] text-text-muted">({r.uid})</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeRecentUid(r.uid)}
                  className="text-text-muted hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5"
                  title="Xóa UID này"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2.5">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Stale data warning */}
        {staleWarning && (
          <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-center gap-2">
            <span>ℹ️</span>
            <span>{staleWarning}</span>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. PLAYER PROFILE HEADER
          ========================================================================= */}
      {result && pInfo && (
        <div className="rounded-3xl border border-border bg-bg-card p-6 md:p-8 space-y-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-border">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-indigo-600 flex items-center justify-center text-white font-display text-2xl font-bold shadow-lg shrink-0">
                {pInfo.nickname.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-display text-2xl font-bold text-text-primary">
                    {pInfo.nickname}
                  </h3>
                  {serverInfo && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${serverInfo.badgeColor}`}>
                      {serverInfo.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-text-secondary mt-1.5 flex-wrap">
                  <span>
                    Hạng Mạo Hiểm (AR): <strong className="text-text-primary font-mono">{pInfo.arLevel}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Cấp Thế Giới (WL): <strong className="text-text-primary font-mono">{pInfo.worldLevel}</strong>
                  </span>
                  {pInfo.achievements !== null && (
                    <>
                      <span>•</span>
                      <span>
                        Thành tựu: <strong className="text-accent-bright font-mono">{pInfo.achievements}</strong>
                      </span>
                    </>
                  )}
                  {pInfo.spiralAbyss && (
                    <>
                      <span>•</span>
                      <span>
                        La Hoàn: <strong className="text-purple-400 font-mono">{pInfo.spiralAbyss}</strong>
                      </span>
                    </>
                  )}
                </div>

                {pInfo.signature && (
                  <p className="text-xs text-text-muted italic mt-2 max-w-xl">
                    &ldquo;{pInfo.signature}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
              <button
                type="button"
                onClick={handleCopyUid}
                className="px-3.5 py-2 rounded-xl border border-border bg-bg-elevated hover:bg-bg-card text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <span>{copiedUid ? "✅ Đã chép" : "📋 Chép UID"}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl border border-border bg-bg-elevated hover:bg-bg-card text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <span>{copiedLink ? "✅ Đã chép link" : "🔗 Chia sẻ"}</span>
              </button>

              <button
                type="button"
                onClick={() => void handleSync(resultUid || undefined, true)}
                disabled={refreshing || refreshCooldown > 0}
                className="px-4 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className={refreshing ? "animate-spin" : ""}>🔄</span>
                <span>{refreshCooldown > 0 ? `Làm mới (${refreshCooldown}s)` : "Làm mới"}</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              3. CHARACTER SHOWCASE GRID
              ========================================================================= */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display text-lg font-bold text-text-primary">
                Trưng Bày Nhân Vật ({result.showcaseCharacters.length} nhân vật)
              </h4>
              <span className="text-xs text-text-muted">
                Bấm vào thẻ để xem chi tiết và đối chiếu build KQM
              </span>
            </div>

            {result.showcaseCharacters.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border border-dashed border-border text-xs text-text-muted space-y-2">
                <div>Chưa có nhân vật nào được hiển thị trong Showcase của tài khoản này.</div>
                <div>Vui lòng mở menu game và bật công tắc &quot;Hiển thị chi tiết nhân vật&quot;.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.showcaseCharacters.map((char, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedCharacter(char)}
                    className="p-4 rounded-2xl border border-border bg-bg-elevated hover:border-accent-500 transition-all cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <div>
                      {/* Avatar header */}
                      <div className="flex items-center gap-3 mb-3">
                        {char.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={char.iconUrl}
                            alt={char.characterName ?? `Avatar ${char.avatarId}`}
                            className="w-12 h-12 rounded-xl object-cover bg-bg-card border border-border shrink-0 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-bg-card border border-border flex items-center justify-center font-bold text-text-muted text-sm shrink-0">
                            ?
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-text-primary truncate group-hover:text-accent-bright transition-colors">
                            {char.characterName ?? `Avatar ${char.avatarId}`}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">
                            Lv. {char.level} · <span className="font-semibold text-accent-bright">C{char.constellations}</span>
                          </div>
                        </div>
                      </div>

                      {/* Weapon badge */}
                      {char.weapon && (
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-bg-card border border-border/60 text-xs mb-3">
                          {char.weapon.iconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={char.weapon.iconUrl}
                              alt={char.weapon.name}
                              className="w-6 h-6 rounded object-contain shrink-0"
                            />
                          ) : (
                            <WeaponIcon type="Sword" size={16} />
                          )}
                          <span className="truncate font-medium text-text-primary text-[11px]">
                            {char.weapon.name} (R{char.weapon.refinement})
                          </span>
                        </div>
                      )}

                      {/* Quick stats */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-text-muted mb-3 font-mono">
                        <div>CR: <strong className="text-text-primary">{char.fightProps.critRate}%</strong></div>
                        <div>CD: <strong className="text-text-primary">{char.fightProps.critDmg}%</strong></div>
                        <div>ER: <strong className="text-text-primary">{char.fightProps.er}%</strong></div>
                        <div>EM: <strong className="text-text-primary">{char.fightProps.em}</strong></div>
                      </div>
                    </div>

                    {/* Bottom CV / Action */}
                    <div className="pt-2.5 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="text-[10px] uppercase font-bold text-accent-bright">
                        {char.totalCritValue} CV
                      </span>
                      <span className="text-[11px] text-accent-bright font-semibold group-hover:underline">
                        Xem chi tiết &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          4. INTERACTIVE CHARACTER DETAIL & BUILD ANALYZER MODAL
          ========================================================================= */}
      {selectedCharacter && (
        <CharacterDetailModal
          char={selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          onUseForDpsCalculator={(c) => {
            setSelectedCharacter(null);
            handleUseBuild(c);
          }}
        />
      )}
    </div>
  );
}
