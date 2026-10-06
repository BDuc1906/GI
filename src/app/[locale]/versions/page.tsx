import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { countUnknown, getVersionIndex, summarize } from "@/lib/game/versions";

export const dynamic = "force-dynamic";

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
            const chips = index.sources
              .map((src) => ({ label: src.label, n: s.bySource[src.key]?.added ?? 0 }))
              .filter((c) => c.n > 0);
            return (
              <li key={v}>
                <Link
                  href={`/versions/${v}`}
                  className="surface-card p-4 flex flex-col gap-3 h-full group"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-2xl font-bold text-text-primary group-hover:text-accent-bright transition-colors">
                      Phiên bản {v}
                    </span>
                    {v === latest && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-bg-elevated text-accent-bright font-semibold">
                        Mới nhất
                      </span>
                    )}
                  </div>
                  {chips.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {chips.map((c) => (
                        <li
                          key={c.label}
                          className="text-xs px-2 py-0.5 rounded-full border border-border text-text-secondary"
                        >
                          +{c.n} {c.label.toLowerCase()}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-muted">Không có mục mới được đánh dấu.</p>
                  )}
                  <p className="text-xs text-text-muted mt-auto">
                    Tổng thêm: {s.added} · Đã có trước: {s.before}
                  </p>
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
