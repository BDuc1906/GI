import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { countUnknown, getVersionIndex, summarize } from "@/core/game/versions";
import { resolveVersionBackgroundArt, getVersionTheme } from "@/core/game/version-art";
import { SafeImage } from "@/components/ui/SafeImage";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createLocalizedMetadata({
    locale,
    pathname: "versions",
    title: "Lịch sử phiên bản Genshin Impact — mỗi bản thêm gì | LEIBO",
    description:
      "Nội dung theo từng phiên bản game: nhân vật, vũ khí, thánh di vật, bí cảnh và nguyên liệu thêm vào ở mỗi bản, từ lúc ra mắt đến hiện tại.",
  });
}

export default async function VersionsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const index = await getVersionIndex();
  const newestFirst = [...index.versions].reverse();
  const latest = newestFirst[0];
  const unknown = countUnknown(index);

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: "Lịch sử phiên bản", path: "/versions" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">
        Lịch sử phiên bản
      </h1>
      <p className="text-sm text-text-secondary mb-8 max-w-3xl">
        Chọn một phiên bản để xem <strong>bản đó thêm gì</strong>, <strong>trước đó đã có gì</strong> và{" "}
        <strong>những gì chỉ xuất hiện ở các bản sau</strong>. Dữ liệu tính từ phiên bản{" "}
        {index.versions[0] ?? "?"} đến {latest ?? "?"}.
      </p>

      {newestFirst.length === 0 ? (
        <p className="text-text-muted text-sm">
          Chưa có dữ liệu phiên bản. Hãy chạy lại seed để điền cột <code>gameVersion</code>.
        </p>
      ) : (
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newestFirst.map((v) => {
            const s = summarize(index, v);
            const theme = getVersionTheme(v);
            const art = resolveVersionBackgroundArt(v);
            return (
              <li key={v}>
                <Link
                  href={`/versions/${v}`}
                  className="group relative flex min-h-[170px] sm:min-h-[190px] flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-bg-card p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-accent-bright/60 active:scale-[0.99]"
                >
                  {/* Key Visual nghệ thuật độc quyền chính thức của miHoYo phủ kín toàn bộ thẻ */}
                  {art && (
                    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
                      <SafeImage
                        src={art}
                        alt={`Key Visual Phiên bản ${v}`}
                        fill
                        className="object-cover object-center opacity-80 group-hover:opacity-95 transition-all duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {/* Lớp phủ điện ảnh đa tầng đảm bảo chữ trắng nổi bật 100% */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/35 group-hover:from-black/90 group-hover:via-black/45 transition-colors" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
                      <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15 group-hover:ring-white/30 transition-colors" />
                    </div>
                  )}

                  {/* Top Bar: Số hiệu phiên bản + Tag số mục mới */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-xs font-black tracking-wide text-accent-bright shadow-sm">
                      Phiên bản {v}
                    </span>
                    {s.added > 0 && (
                      <span className="text-[11px] font-bold text-white/90 bg-black/55 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/15">
                        +{s.added} mục mới
                      </span>
                    )}
                  </div>

                  {/* Center: Tên chủ đề chính thức (Theme) in đậm chữ trắng phong cách Prydwen */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto py-2 px-2">
                    <h3 className="font-display text-xl sm:text-2xl font-black text-white leading-tight tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] group-hover:text-accent-bright transition-colors">
                      {theme?.vi ?? `Cập Nhật Phiên Bản ${v}`}
                    </h3>
                    {theme?.en && theme.en !== theme.vi && (
                      <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                        {theme.en}
                      </p>
                    )}
                  </div>

                  {/* Bottom Bar: Thống kê số lượng + Hiệu ứng viền dạ quang */}
                  <div className="relative z-10 flex items-center justify-between text-xs text-white/75 pt-1">
                    <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] text-[11px] font-medium">
                      Đã có trước: {s.before} mục
                    </span>
                    <span className="text-accent-bright text-xs font-bold group-hover:translate-x-0.5 transition-transform">
                      Khám phá &rarr;
                    </span>
                  </div>

                  {/* Thanh accent dạ quang ở cạnh đáy */}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent-bright to-transparent opacity-60 group-hover:h-1.5 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_12px_var(--accent-bright)]" />
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <p className="text-xs text-text-muted mt-8 max-w-3xl">
        Mục không đánh dấu phiên bản (nội dung gốc từ lúc ra mắt hoặc trước khi nguồn dữ liệu bắt đầu
        ghi nhận) được tính là &ldquo;đã có từ trước&rdquo; ở mọi phiên bản.
        {unknown > 0 && ` Ngoài ra ${unknown} mục chưa có dữ liệu phiên bản nên không nằm trong thống kê.`}
      </p>
    </div>
  );
}
