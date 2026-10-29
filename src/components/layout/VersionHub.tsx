import { Link } from "@/i18n/navigation";
import { getVersionIndex, summarize, pickEntries, type VersionEntry } from "@/core/game/versions";
import { SafeImage } from "@/components/ui/SafeImage";

const SOURCE_ICONS: Record<string, string> = {
  characters: "/local-genshin-assets/ui/characters.png",
  weapons: "/local-genshin-assets/ui/sword.png",
  artifacts: "/local-genshin-assets/ui/artifacts.png",
  domains: "/local-genshin-assets/ui/domain.png",
  materials: "/local-genshin-assets/ui/items.png",
};

/**
 * Khối "Cập Nhật Phiên Bản Genshin Impact" trên trang chủ
 * Hiển thị đầy đủ hình ảnh, icon game chuẩn và liên kết trực tiếp tới các nhân vật/vũ khí mới.
 */
export async function VersionHub() {
  let latest: string | undefined;
  let chips: Array<{ key: string; label: string; n: number; icon: string }> = [];
  let total = 0;
  let newCharacters: VersionEntry[] = [];
  let newWeapons: VersionEntry[] = [];

  try {
    const index = await getVersionIndex();
    latest = index.versions.at(-1);
    if (latest) {
      const s = summarize(index, latest);
      total = s.added;
      chips = index.sources
        .map((src) => ({
          key: src.key,
          label: src.label,
          n: s.bySource[src.key]?.added ?? 0,
          icon: SOURCE_ICONS[src.key] ?? "/local-genshin-assets/ui/timeline.png",
        }))
        .filter((c) => c.n > 0);

      newCharacters = pickEntries(index.entries["characters"] ?? [], latest, "added");
      newWeapons = pickEntries(index.entries["weapons"] ?? [], latest, "added");
    }
  } catch {
    return null; // không để lỗi DB làm hỏng cả trang chủ
  }

  if (!latest) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/local-genshin-assets/ui/timeline.png"
              alt=""
              width={20}
              height={20}
              className="w-5 h-5 object-contain"
            />
            <span className="text-xs font-mono uppercase text-accent-bright font-semibold tracking-wider">
              Dòng Thời Gian Teyvat
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Cập Nhật Phiên Bản Genshin Impact
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Theo dõi chi tiết thay đổi và nhân vật/vũ khí mới theo từng bản cập nhật
          </p>
        </div>
        <Link
          href="/versions"
          className="text-sm font-semibold text-accent-bright hover:underline shrink-0 flex items-center gap-1"
        >
          <span>Lịch sử phiên bản</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Main Version Showcase Card */}
      <div className="bg-gradient-to-br from-bg-card via-bg-card/90 to-bg-elevated/40 border border-border/80 hover:border-accent-500/50 rounded-2xl p-6 transition-all shadow-sm space-y-6">
        {/* Version banner title & stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase text-accent-bright tracking-wider font-semibold">
              Bản phát hành hiện tại
            </span>
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary mt-0.5 tracking-tight">
              Phiên bản {latest}
            </h3>
          </div>
          <span className="px-4 py-1.5 bg-accent-500/15 text-accent-bright border border-accent-500/30 text-xs font-semibold rounded-full self-start sm:self-center">
            +{total} nội dung &amp; dữ liệu mới
          </span>
        </div>

        {/* Category count chips with in-game icons */}
        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-2.5">
            {chips.map((c) => (
              <li
                key={c.key}
                className="flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-xl bg-bg-elevated/80 border border-border/80 text-text-primary font-medium shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.icon} alt="" width={18} height={18} className="w-4.5 h-4.5 object-contain shrink-0" />
                <span>
                  +{c.n} {c.label.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Visual Spotlight: Newly Added Characters */}
        {newCharacters.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/local-genshin-assets/ui/characters.png"
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
                <span>Nhân vật mới xuất hiện ({newCharacters.length})</span>
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {newCharacters.map((char) => (
                <Link
                  key={char.id}
                  href={`/characters/${char.id}`}
                  className="group flex items-center gap-3 p-3 rounded-xl bg-bg-elevated/60 border border-border/70 hover:border-accent-500 hover:bg-bg-elevated transition-all"
                >
                  <div className="relative w-12 h-12 rounded-xl bg-bg-card border border-border/60 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    <SafeImage
                      src={char.iconUrl}
                      fallbackSrcs={[char.iconUrlOriginal]}
                      alt={char.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-text-primary group-hover:text-accent-bright transition-colors truncate">
                      {char.name}
                    </p>
                    {char.meta && (
                      <p className="text-xs text-amber-400 font-medium">
                        {char.meta}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Visual Spotlight: Newly Added Weapons */}
        {newWeapons.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/40">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/local-genshin-assets/ui/sword.png"
                  alt=""
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain"
                />
                <span>Vũ khí mới ({newWeapons.length})</span>
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {newWeapons.map((wpn) => (
                <Link
                  key={wpn.id}
                  href={`/weapons/${wpn.id}`}
                  className="group flex flex-col items-center p-2.5 rounded-xl bg-bg-elevated/50 border border-border/70 hover:border-accent-500 hover:bg-bg-elevated transition-all text-center"
                >
                  <div className="relative w-11 h-11 rounded-lg bg-bg-card border border-border/50 overflow-hidden mb-1.5 group-hover:scale-105 transition-transform">
                    <SafeImage
                      src={wpn.iconUrl}
                      fallbackSrcs={[wpn.iconUrlOriginal]}
                      alt={wpn.name}
                      fill
                      sizes="44px"
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="font-medium text-xs text-text-primary group-hover:text-accent-bright transition-colors truncate w-full">
                    {wpn.name}
                  </p>
                  {wpn.meta && (
                    <span className="text-[10px] text-amber-400 font-semibold mt-0.5">
                      {wpn.meta}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`/versions/${latest}`}
            className="btn-anemo px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm inline-flex items-center gap-2"
          >
            <span>Xem chi tiết bản {latest}</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/versions"
            className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Tất cả phiên bản từ 1.0
          </Link>
        </div>
      </div>
    </section>
  );
}
