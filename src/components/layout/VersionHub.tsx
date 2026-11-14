import { Link } from "@/i18n/navigation";
import { getVersionIndex, pickEntries, type VersionEntry } from "@/core/game/versions";
import { resolveVersionBackgroundArt, getVersionTheme } from "@/core/game/version-art";
import { SafeImage } from "@/components/ui/SafeImage";
import { getTranslations } from "next-intl/server";

/**
 * Khối "Cập Nhật Phiên Bản Genshin Impact" trên trang chủ
 * Hiển thị đầy đủ hình ảnh, icon game chuẩn và liên kết trực tiếp tới các nhân vật/vũ khí mới.
 */
export async function VersionHub() {
  const t = await getTranslations("Version");
  const tHome = await getTranslations("Home");
  let latest: string | undefined;
  let newCharacters: VersionEntry[] = [];
  let newWeapons: VersionEntry[] = [];

  try {
    const index = await getVersionIndex();
    latest = index.versions.at(-1);
    if (latest) {
      newCharacters = pickEntries(index.entries["characters"] ?? [], latest, "added");
      newWeapons = pickEntries(index.entries["weapons"] ?? [], latest, "added");
    }
  } catch {
    return null; // không để lỗi DB làm hỏng cả trang chủ
  }

  if (!latest) return null;

  const backgroundArt = resolveVersionBackgroundArt(latest, newCharacters);
  const theme = getVersionTheme(latest);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            {t("title")}
          </h2>
        </div>
        <Link
          href="/versions"
          className="text-sm font-semibold text-accent-bright hover:underline shrink-0 flex items-center gap-1"
        >
          <span>{tHome("viewAll")}</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Main Version Showcase Card with Exclusive Key Art Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-bg-card via-bg-card/95 to-bg-elevated/60 border border-border/80 hover:border-accent-500/50 rounded-2xl p-6 transition-all shadow-sm group">
        {/* Exclusive Version Background Art Layer */}
        {backgroundArt && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
            <SafeImage
              src={backgroundArt}
              alt={`Version ${latest} Art`}
              fill
              className="object-cover object-right md:object-right-top opacity-55 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700 ease-out"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
            {/* Cinematic dark gradients for crisp contrast and readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-bg-card/95 via-bg-card/75 md:via-bg-card/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-bg-card/30" />
          </div>
        )}

        <div className="relative z-10 space-y-6">
          {/* Version banner title & stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-mono uppercase text-accent-bright tracking-wider font-semibold">
                {tHome("versionCurrent")}
              </span>
              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary mt-0.5 tracking-tight">
                  {tHome("versionNumber", { version: latest })}
                </h3>
                {theme && (
                  <span className="text-sm font-medium text-text-secondary/90 italic">
                    — {theme.vi}
                  </span>
                )}
              </div>
            </div>
          </div>

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
                <span>{tHome("latestCharacters")} ({newCharacters.length})</span>
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {newCharacters.map((char) => (
                <Link
                  key={char.id}
                  href={`/characters/${char.id}`}
                  className="group relative flex min-h-[140px] sm:min-h-[160px] flex-col items-center justify-center rounded-2xl bg-bg-card border border-border/80 p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-accent-bright overflow-hidden active:scale-[0.98]"
                >
                  {/* Full Background Character Splash / Portrait */}
                  <SafeImage
                    src={char.iconUrl}
                    fallbackSrcs={[char.iconUrlOriginal]}
                    alt={char.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
                    className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 ease-out group-hover:scale-110"
                  />

                  {/* Prydwen-style dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30 transition-colors duration-300 group-hover:from-black/85 group-hover:via-black/50 group-hover:to-black/20" />
                  <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all" />

                  {/* Top Rarity Badge */}
                  {char.meta && (
                    <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-black/65 border border-white/15 backdrop-blur-md text-[11px] font-bold text-amber-400 drop-shadow">
                      {char.meta}
                    </div>
                  )}

                  {/* White Centered Text (Prydwen Style) */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center w-full px-1 gap-1">
                    <p className="font-display font-extrabold text-sm sm:text-base text-white tracking-wide group-hover:text-accent-bright transition-colors truncate max-w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                      {char.name}
                    </p>
                  </div>

                  {/* Glowing bottom accent line */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-400/80 opacity-60 transition-all duration-300 group-hover:h-1.5 group-hover:opacity-100" />
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
                <span>{tHome("latestWeapons")} ({newWeapons.length})</span>
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {newWeapons.map((wpn) => (
                <Link
                  key={wpn.id}
                  href={`/weapons/${wpn.id}`}
                  className="group relative flex min-h-[120px] flex-col items-center justify-center rounded-2xl bg-bg-card border border-border/80 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-accent-bright overflow-hidden active:scale-[0.98]"
                >
                  <SafeImage
                    src={wpn.iconUrl}
                    fallbackSrcs={[wpn.iconUrlOriginal]}
                    alt={wpn.name}
                    fill
                    sizes="120px"
                    className="absolute inset-0 h-full w-full object-contain p-2.5 opacity-85 transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35 transition-colors duration-300" />
                  <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />

                  {wpn.meta && (
                    <div className="absolute top-2 right-2 z-10 px-1.5 py-0.2 rounded bg-black/60 border border-white/15 backdrop-blur-md text-[10px] font-bold text-amber-400">
                      {wpn.meta}
                    </div>
                  )}

                  <div className="relative z-10 text-center w-full px-1 mt-auto">
                    <p className="font-display font-extrabold text-xs text-white group-hover:text-accent-bright transition-colors truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                      {wpn.name}
                    </p>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-1 bg-accent-bright opacity-60 transition-all duration-300 group-hover:opacity-100" />
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
            <span>{tHome("versionViewDetails", { version: latest })}</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/versions"
            className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            {tHome("viewAll")}
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
}
