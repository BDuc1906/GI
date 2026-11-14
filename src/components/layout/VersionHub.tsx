import { Link } from "@/i18n/navigation";
import { getVersionIndex, summarize } from "@/core/game/versions";
import { resolveVersionBackgroundArt, getVersionTheme } from "@/core/game/version-art";
import { SafeImage } from "@/components/ui/SafeImage";
import { getTranslations } from "next-intl/server";

/**
 * Khối "Cập Nhật Phiên Bản Genshin Impact" trên trang chủ.
 *
 * Thiết kế chuẩn phong cách Key Visual điện ảnh:
 * - Thẻ to (Hero Showcase) phủ kín bởi Key Visual chính thức độc quyền của phiên bản (miHoYo Special Program Livestream).
 * - Bỏ hoàn toàn các icon nhân vật / vũ khí rải rác trên thẻ to để không che khuất background nghệ thuật.
 * - Hiển thị tên phiên bản, tên chủ đề chính thức (Theme) và tổng số lượng nội dung mới.
 * - Nút "Xem chi tiết bản {version}" dẫn trực tiếp vào trang chi tiết phiên bản để xem đầy đủ danh sách nhân vật, vũ khí, thánh di vật vừa cập nhật.
 */
export async function VersionHub() {
  const t = await getTranslations("Version");
  const tHome = await getTranslations("Home");
  let latest: string | undefined;
  let totalAdded = 0;

  try {
    const index = await getVersionIndex();
    latest = index.versions.at(-1);
    if (latest) {
      const summary = summarize(index, latest);
      totalAdded = summary.added;
    }
  } catch {
    return null; // không để lỗi DB làm hỏng cả trang chủ
  }

  if (!latest) return null;

  const backgroundArt = resolveVersionBackgroundArt(latest);
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

      {/* Main Version Showcase Card with Full-Bleed Key Visual Wallpaper */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 hover:border-accent-bright/50 transition-all duration-500 shadow-2xl group min-h-[300px] sm:min-h-[360px] md:min-h-[420px] flex flex-col justify-between">
        {/* Full-bleed Official Key Visual Wallpaper */}
        {backgroundArt && (
          <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
            <SafeImage
              src={backgroundArt}
              alt={`Version ${latest} Art`}
              fill
              className="object-cover object-center opacity-85 group-hover:opacity-95 group-hover:scale-[1.03] transition-all duration-700 ease-out"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
            {/* Multi-layer cinematic vignette for maximum legibility & atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15 group-hover:ring-white/30 transition-all" />
          </div>
        )}

        {/* Top badges bar */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 pb-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-bright/20 border border-accent-bright/40 text-accent-bright text-xs font-mono font-bold tracking-widest uppercase backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-accent-bright animate-pulse" />
              {tHome("versionCurrent")}
            </span>
            {totalAdded > 0 && (
              <span className="px-3 py-1 rounded-full bg-black/60 border border-white/15 text-white/90 text-xs font-semibold backdrop-blur-md">
                +{totalAdded} nội dung mới
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-white/60 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-sm">
            GENSHIN IMPACT
          </span>
        </div>

        {/* Center / Bottom Title and Actions */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 pt-4 flex flex-col justify-end space-y-5">
          <div className="space-y-2 max-w-2xl">
            <span className="text-sm font-semibold tracking-wider text-accent-bright uppercase drop-shadow">
              {tHome("versionNumber", { version: latest })}
            </span>
            <Link href={`/versions/${latest}`} className="group/title block">
              <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] group-hover/title:text-accent-bright transition-colors">
                {theme ? theme.vi : `Phiên bản ${latest}`}
              </h3>
            </Link>
            {theme?.en && (
              <p className="text-sm sm:text-base font-medium text-white/80 italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {theme.en}
              </p>
            )}
            <p className="text-xs sm:text-sm text-white/75 max-w-xl leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none pt-1">
              Khám phá toàn bộ nhân vật, vũ khí, thánh di vật, bí cảnh và nội dung cốt truyện mới được cập nhật trong phiên bản này.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`/versions/${latest}`}
              className="px-6 py-3 rounded-xl bg-accent-bright text-black font-bold text-sm sm:text-base hover:bg-accent-bright/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-accent-bright/25 inline-flex items-center gap-2"
            >
              <span>{tHome("versionViewDetails", { version: latest })}</span>
              <span className="text-base font-black">&rarr;</span>
            </Link>
            <Link
              href="/versions"
              className="px-5 py-3 rounded-xl bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 text-white font-semibold text-sm sm:text-base backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {tHome("viewAll")}
            </Link>
          </div>
        </div>

        {/* Glowing bottom accent line */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent-bright to-transparent opacity-70 group-hover:opacity-100 group-hover:h-1.5 transition-all duration-300 shadow-[0_0_12px_var(--accent-bright)]" />
      </div>
    </section>
  );
}
