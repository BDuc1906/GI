"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { EnkaShowcaseResult, EnkaShowcaseCharacter } from "@/app/api/tools/enka/[uid]/route";
import { WeaponIcon } from "@/features/weapons/components/WeaponIcon";

// ---------------------------------------------------------------------------
// localStorage hook & Recent UIDs (SSR-safe via useSyncExternalStore)
// ---------------------------------------------------------------------------

const STORAGE_KEY = "leibo-enka-last-uid";
const RECENT_UIDS_KEY = "leibo-enka-recent-uids";

export interface RecentUid {
  uid: string;
  nickname: string;
  arLevel: number;
  worldLevel: number;
  avatarCount: number;
  syncedAt: number;
}

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

function getGenshinServer(uid: string): { name: string; badgeColor: string } {
  if (uid.startsWith("8") || uid.startsWith("18")) {
    return { name: "Châu Á (Asia)", badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
  }
  if (uid.startsWith("6")) {
    return { name: "Bắc Mỹ (America)", badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
  }
  if (uid.startsWith("7")) {
    return { name: "Châu Âu (Europe)", badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30" };
  }
  if (uid.startsWith("9")) {
    return { name: "TW / HK / MO", badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
  }
  if (uid.startsWith("1") || uid.startsWith("2")) {
    return { name: "Trung Quốc (China)", badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
  }
  return { name: "Máy chủ Teyvat", badgeColor: "bg-gray-500/10 text-gray-400 border-gray-500/30" };
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function StatValue({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary font-mono font-semibold">{value}</span>
    </span>
  );
}

function CharacterShowcaseCard({
  char,
  uid,
  onUseBuild,
}: {
  char: EnkaShowcaseCharacter;
  uid: string;
  onUseBuild: (char: EnkaShowcaseCharacter) => void;
}) {
  const t = useTranslations("BuildAdvisor");
  const fightProps = char.fightProps;
  const [showArtifacts, setShowArtifacts] = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);

  async function handleGetAdvice() {
    if (!char.characterId || advisorLoading) return;
    setAdvisorLoading(true);
    setAdvisorError(null);
    setAdvice(null);

    try {
      const response = await fetch("/api/tools/build-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, characterId: char.characterId }),
      });
      const payload = await response.json() as
        | { success: true; data: { advice: string } }
        | { success: false; error: { message: string } };

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? t("error") : payload.error.message);
      }

      setAdvice(payload.data.advice);
    } catch (error) {
      setAdvisorError(error instanceof Error ? error.message : t("error"));
    } finally {
      setAdvisorLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-card p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {char.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={char.iconUrl}
              alt={char.characterName ?? `Avatar ${char.avatarId}`}
              className="w-12 h-12 rounded-full object-cover bg-bg-elevated border border-border-default shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center text-text-muted text-xs shrink-0">
              ?
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-text-primary truncate">
              {char.characterName ?? `ID: ${char.avatarId}`}
            </p>
            <p className="text-xs text-text-secondary">
              Lv. {char.level} · C{char.constellations}
            </p>
          </div>
        </div>

        {char.totalCritValue > 0 && (
          <div className="text-right shrink-0" title={`Tổng điểm CV: ${char.totalCritValue}`}>
            <div className="text-xs font-bold font-mono text-text-primary">{char.totalCritValue} CV</div>
            <div className="text-[10px] uppercase font-semibold text-text-muted">{char.totalCvRating}</div>
          </div>
        )}
      </div>

      {/* Weapon */}
      {char.weapon && (
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-bg-elevated/60 border border-border-default text-xs">
          {char.weapon.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={char.weapon.iconUrl}
              alt={char.weapon.name}
              className="w-8 h-8 rounded object-contain bg-bg-card border border-border-default shrink-0"
              loading="lazy"
            />
          ) : (
            <WeaponIcon type="Sword" size={20} className="shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-text-primary truncate">{char.weapon.name}</div>
            <div className="text-[11px] text-text-secondary">
              Lv. {char.weapon.level} · Tinh luyện {char.weapon.refinement}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-1.5">
        <StatValue label="HP" value={fightProps.hp.toLocaleString()} />
        <StatValue label="ATK" value={fightProps.atk.toLocaleString()} />
        <StatValue label="DEF" value={fightProps.def.toLocaleString()} />
        <StatValue label="CR" value={`${fightProps.critRate}%`} />
        <StatValue label="CD" value={`${fightProps.critDmg}%`} />
        <StatValue label="EM" value={fightProps.em} />
        <StatValue label="ER" value={`${fightProps.er}%`} />
      </div>

      {/* Talent levels */}
      {char.talentLevels.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <span>Thiên phú:</span>
          {char.talentLevels.map((lv, i) => (
            <span
              key={i}
              className="bg-bg-elevated border border-border-default rounded px-1.5 py-0.5 font-mono text-text-primary"
            >
              {lv}
            </span>
          ))}
        </div>
      )}

      {/* Toggle xem chi tiết Thánh di vật */}
      {char.artifacts.length > 0 && (
        <div className="mt-1">
          <button
            onClick={() => setShowArtifacts(!showArtifacts)}
            className="w-full text-xs py-1.5 px-3 rounded-lg border border-border-default bg-bg-elevated hover:bg-bg-card transition-colors text-text-secondary flex items-center justify-between"
          >
            <span>Thánh di vật ({char.artifacts.length}/5 món)</span>
            <span className="text-accent-bright font-mono font-semibold">
              {showArtifacts ? "Thu gọn ▲" : "Chi tiết CV ▼"}
            </span>
          </button>

          {showArtifacts && (
            <div className="mt-2 space-y-2 border-t border-border-default pt-2">
              {char.artifacts.map((art, idx) => {
                const artColor =
                  art.critValue >= 35
                    ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/5"
                    : art.critValue >= 25
                      ? "text-purple-400 border-purple-500/30 bg-purple-500/5"
                      : "text-text-primary border-border-default bg-bg-elevated/40";

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-xs flex flex-col gap-1 ${artColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary">
                        {art.slotName} (+{art.level})
                      </span>
                      <span className="font-mono font-bold">
                        {art.critValue > 0 ? `${art.critValue} CV` : "0 CV"}
                        <span className="ml-1 text-[10px] font-normal opacity-80">({art.cvRating})</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-accent-bright/90">
                      Chính: {art.mainStat.label} +{art.mainStat.value}
                    </div>

                    {art.substats.length > 0 && (
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-text-secondary">
                        {art.substats.map((sub, sIdx) => (
                          <div key={sIdx} className="truncate">
                            • {sub.label}: {sub.value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      {char.characterId && (
        <div className="mt-auto space-y-2">
          <button
            onClick={() => onUseBuild(char)}
            className="w-full text-xs px-3 py-1.5 rounded-lg border border-accent-500/60 bg-bg-elevated text-accent-bright hover:border-accent-500 transition-colors font-medium"
          >
            Dùng build này cho DPS Calculator
          </button>
          <button
            type="button"
            onClick={handleGetAdvice}
            disabled={advisorLoading}
            aria-busy={advisorLoading}
            className="w-full text-xs px-3 py-2 rounded-lg bg-accent-500 text-bg-primary hover:bg-accent-bright disabled:opacity-60 transition-colors font-semibold"
          >
            {advisorLoading ? t("loading") : t("button")}
          </button>
          <p className="text-[10px] leading-relaxed text-text-muted">{t("privacyNote")}</p>
          {advisorError && (
            <p role="alert" className="text-xs text-red-400">{advisorError}</p>
          )}
          {advice && (
            <div aria-live="polite" className="max-h-80 overflow-y-auto rounded-lg border border-border-default bg-bg-elevated/60 p-3">
              <h4 className="mb-2 text-xs font-semibold text-accent-bright">{t("title")}</h4>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-text-secondary">{advice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShowcaseGuideBanner({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-bg-card to-bg-card p-5 sm:p-6 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
          💡
        </div>
        <div>
          <h3 className="font-display font-bold text-text-primary text-base sm:text-lg">
            Cách mở Trưng Bày Nhân Vật (Showcase) trong Game
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Mặc định game Genshin Impact có thể ẩn thông tin chi tiết. Hãy làm theo 4 bước sau để hệ thống soi được trang bị của bạn:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <div className="p-3.5 rounded-xl border border-border-default bg-bg-elevated/60 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-bright font-mono font-bold text-xs flex items-center justify-center">
              1
            </span>
            <span className="font-semibold text-xs text-text-primary">Mở Menu Paimon</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-border-default font-mono text-[10px]">Esc</kbd> (PC) hoặc chạm biểu tượng Paimon góc trên bên trái màn hình.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-border-default bg-bg-elevated/60 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-bright font-mono font-bold text-xs flex items-center justify-center">
              2
            </span>
            <span className="font-semibold text-xs text-text-primary">Vào Sửa Hồ Sơ</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Bấm vào biểu tượng cây bút cạnh Tên/Nickname của bạn và chọn <strong className="text-text-primary">Sửa Hồ Sơ</strong>.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-border-default bg-bg-elevated/60 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-bright font-mono font-bold text-xs flex items-center justify-center">
              3
            </span>
            <span className="font-semibold text-xs text-text-primary">Chọn Trưng Bày</span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Chọn mục <strong className="text-text-primary">Trưng bày nhân vật</strong>, thêm tối đa 8 nhân vật bạn muốn soi thánh di vật vào các ô trống.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-bg-primary font-mono font-bold text-xs flex items-center justify-center">
              4
            </span>
            <span className="font-semibold text-xs text-amber-400">Bật Công Tắc Chi Tiết</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            <strong className="text-amber-300">Bắt buộc:</strong> Gạt BẬT công tắc <strong className="text-amber-200">&quot;Hiển thị chi tiết nhân vật&quot;</strong> ở góc dưới bên trái.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-border-default/50 flex-wrap">
        <p className="text-xs text-text-muted flex items-center gap-1.5">
          <span>⏳</span>
          Sau khi lưu trong game, vui lòng đợi 1–2 phút để server HoYoverse đồng bộ ra ngoài.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-bg-primary font-bold text-xs transition-colors shadow-sm"
          >
            🔄 Thử đồng bộ lại
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-default bg-bg-card p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-bg-elevated" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-bg-elevated rounded w-24" />
          <div className="h-3 bg-bg-elevated rounded w-16" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-5 w-14 bg-bg-elevated rounded" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface EnkaImporterClientProps {
  /** Callback khi người dùng muốn populate DPS Calculator */
  onUseBuild?: (char: EnkaShowcaseCharacter) => void;
}

export function EnkaImporterClient({ onUseBuild }: EnkaImporterClientProps) {
  const router = useRouter();
  const savedUid = useLocalStorageValue(STORAGE_KEY);
  const recentUids = useSyncExternalStore(subscribe, getStoredRecentUids, getServerRecentUids);

  const [uid, setUid] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EnkaShowcaseResult | null>(null);
  const [resultUid, setResultUid] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Khởi tạo UID từ localStorage khi mount (chỉ cần set 1 lần)
  const initUid = useCallback((val: string) => {
    if (!uid && val) setUid(val);
  }, [uid]);

  // Sync savedUid vào input khi dữ liệu từ localStorage load về
  if (savedUid && !uid) {
    initUid(savedUid);
  }

  function validateUid(val: string): string | null {
    if (!/^\d+$/.test(val)) return "UID chỉ được chứa chữ số.";
    if (val.length < 9 || val.length > 10) return "UID phải có 9 hoặc 10 chữ số.";
    return null;
  }

  const handleSync = useCallback(async (targetUid?: string) => {
    const rawUid = (targetUid ?? uid).trim();
    const validationError = validateUid(rawUid);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (targetUid && targetUid !== uid) {
      setUid(targetUid);
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setResultUid(null);

    try {
      const resp = await fetch(`/api/tools/enka/${rawUid}`);
      const json = (await resp.json()) as
        | { success: true; data: EnkaShowcaseResult }
        | { success: false; error: { code: string; message: string } };

      if (!json.success) {
        setError(json.error.message);
        return;
      }

      setResult(json.data);
      setResultUid(rawUid);
      setLocalStorageValue(STORAGE_KEY, rawUid);

      saveRecentUid({
        uid: rawUid,
        nickname: json.data.playerInfo.nickname || "Nhà Lữ Hành",
        arLevel: json.data.playerInfo.arLevel || 1,
        worldLevel: json.data.playerInfo.worldLevel || 0,
        avatarCount: json.data.showcaseCharacters.length,
        syncedAt: Date.now(),
      });
    } catch {
      setError("Lỗi kết nối mạng, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // Tự động đồng bộ nếu có query ?uid=... trong URL
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
    // Chuyển dữ liệu showcase sang chế độ DPS đơn của máy tính.
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

  const serverInfo = resultUid ? getGenshinServer(resultUid) : null;

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="rounded-2xl border border-border-default bg-bg-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-xl font-semibold text-text-primary mb-1">
              Nhập UID Genshin Impact
            </h2>
            <p className="text-sm text-text-secondary">
              UID 9 hoặc 10 chữ số — tìm trong game: Menu → Góc dưới bên phải màn hình.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border-default hover:border-amber-500/50 bg-bg-elevated text-text-secondary hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <span>💡</span>
            <span>{showGuide ? "Đóng hướng dẫn" : "Hướng dẫn mở Showcase"}</span>
          </button>
        </div>

        {/* Collapsible Guide */}
        {showGuide && (
          <ShowcaseGuideBanner onRetry={() => void handleSync()} />
        )}

        <div className="flex gap-3 flex-wrap">
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
            placeholder="Ví dụ: 800000001 (9 hoặc 10 số)"
            className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-border-default bg-bg-elevated text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-colors"
          />
          <button
            onClick={() => void handleSync()}
            disabled={loading || uid.length < 9 || uid.length > 10}
            className="px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {loading ? "Đang đồng bộ…" : "Đồng bộ từ game"}
          </button>
        </div>

        {/* Recent UIDs chips */}
        {recentUids.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-xs text-text-muted">UID gần đây:</span>
            {recentUids.map((r) => (
              <div
                key={r.uid}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-default hover:border-accent-500/50 text-xs transition-colors group"
              >
                <button
                  type="button"
                  onClick={() => void handleSync(r.uid)}
                  className="text-text-primary hover:text-accent-bright font-mono font-medium flex items-center gap-1.5"
                  title={`Đồng bộ ${r.nickname} (AR ${r.arLevel})`}
                >
                  <span>{r.uid}</span>
                  <span className="text-text-muted text-[11px] group-hover:text-accent-bright/80 font-sans">
                    ({r.nickname} • AR {r.arLevel})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentUid(r.uid);
                  }}
                  className="text-text-muted hover:text-red-400 p-0.5 rounded text-[10px] leading-none transition-colors"
                  title="Xóa khỏi lịch sử"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
            {error}
          </p>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div>
          <p className="text-sm text-text-muted mb-3">Đang tải dữ liệu showcase…</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Player info */}
          <div className="rounded-xl border border-border-default bg-bg-card p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <p className="text-text-muted text-xs">Tên người chơi</p>
                <p className="font-display text-lg font-bold text-text-primary">
                  {result.playerInfo.nickname}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs">Adventure Rank</p>
                <p className="font-semibold text-text-primary">AR {result.playerInfo.arLevel}</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">World Level</p>
                <p className="font-semibold text-text-primary">WL {result.playerInfo.worldLevel}</p>
              </div>
              {serverInfo && (
                <div>
                  <p className="text-text-muted text-xs">Máy chủ</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${serverInfo.badgeColor} mt-0.5`}>
                    {serverInfo.name}
                  </span>
                </div>
              )}
              {result.playerInfo.signature && (
                <div className="flex-1 min-w-[160px]">
                  <p className="text-text-muted text-xs">Chữ ký</p>
                  <p className="text-sm text-text-secondary italic truncate">
                    {result.playerInfo.signature}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions: Share link & Refresh */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg border border-border-default hover:border-accent-500 bg-bg-elevated text-xs font-medium text-text-secondary hover:text-accent-bright transition-colors flex items-center gap-1.5"
                title="Sao chép liên kết chia sẻ hồ sơ"
              >
                <span>{copiedLink ? "✓" : "🔗"}</span>
                <span>{copiedLink ? "Đã chép link!" : "Chia sẻ link"}</span>
              </button>
              <button
                type="button"
                onClick={() => void handleSync(resultUid ?? uid)}
                className="px-3 py-1.5 rounded-lg border border-border-default hover:border-accent-500 bg-bg-elevated text-xs font-medium text-text-secondary hover:text-accent-bright transition-colors flex items-center gap-1.5"
                title="Làm mới dữ liệu từ game"
              >
                <span>🔄</span>
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Characters grid or Guide if empty */}
          {result.showcaseCharacters.length === 0 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-300 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span>Hồ sơ người chơi chưa hiển thị nhân vật nào trong Trưng Bày.</span>
              </div>
              <ShowcaseGuideBanner onRetry={() => void handleSync(resultUid ?? uid)} />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-secondary font-medium">
                  {result.showcaseCharacters.length} nhân vật trong showcase:
                </p>
                <span className="text-xs text-text-muted">
                  Bấm vào thẻ đồ để xem chi tiết từng mảnh hoặc xin tư vấn từ AI
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {result.showcaseCharacters.map((char) => (
                  <CharacterShowcaseCard
                    key={`${resultUid}:${char.avatarId}`}
                    char={char}
                    uid={resultUid ?? ""}
                    onUseBuild={handleUseBuild}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
