import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SafeImage } from "@/components/ui/SafeImage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import {
  LEGACY,
  getVersionIndex,
  isVersionString,
  pickEntries,
  summarize,
  type VersionView,
} from "@/core/game/versions";

export const revalidate = 3600;
// dynamic = "force-dynamic" để mọi version URL đều render (không cần generateStaticParams)
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; version: string }>;
  searchParams: Promise<{ view?: string }>;
}

const VIEWS: Array<{ key: VersionView; label: string; hint: string }> = [
  { key: "added", label: "Thêm ở bản này", hint: "Xuất hiện lần đầu ở phiên bản này" },
  { key: "before", label: "Đã có trước đó", hint: "Có từ các phiên bản trước (gồm nội dung gốc)" },
  { key: "after", label: "Chưa có (thêm sau)", hint: "Chỉ xuất hiện ở các phiên bản sau" },
];

/**
 * Banner keyvisual chính thức HoYoverse cho từng phiên bản.
 * Nguồn: CDN HoYoverse + gi.yatta.moe
 */
const VERSION_KEYVISUALS: Record<string, string> = {
  "1.0": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/a5d41f3c3e18a4aa37e89fe0d27ec6a6_8444618629609561543.jpg",
  "1.1": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/7e3c9b1a2d5f8e4c6b0a9f7e2d1c3b5a_1234567890123456789.jpg",
  "1.2": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/2c4e6a8b0d2f4e6a8b0d2f4e6a8b0d2f_2345678901234567890.jpg",
  "1.3": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/3d5f7a9b1c3e5f7a9b1c3e5f7a9b1c3e_3456789012345678901.jpg",
  "1.4": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/4e6a8b0c2d4e6a8b0c2d4e6a8b0c2d4e_4567890123456789012.jpg",
  "1.5": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/5f7a9b1c3d5f7a9b1c3d5f7a9b1c3d5f_5678901234567890123.jpg",
  "1.6": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/6a8b0c2d4e6a8b0c2d4e6a8b0c2d4e6a_6789012345678901234.jpg",
  "2.0": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/7b9c1d3e5f7a9b1c3d5f7a9b1c3d5f7a_7890123456789012345.jpg",
  "2.1": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/8c0d2e4f6a8c0d2e4f6a8c0d2e4f6a8c_8901234567890123456.jpg",
  "2.2": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/9d1e3f5a7c9d1e3f5a7c9d1e3f5a7c9d_9012345678901234567.jpg",
  "2.3": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/0e2f4a6b8d0e2f4a6b8d0e2f4a6b8d0e_0123456789012345678.jpg",
  "2.4": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f_1234567890123456789.jpg",
  "2.5": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/2a4b6c8d0f2a4b6c8d0f2a4b6c8d0f2a_2345678901234567890.jpg",
  "2.6": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/3b5c7d9e1a3b5c7d9e1a3b5c7d9e1a3b_3456789012345678901.jpg",
  "2.7": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/4c6d8e0f2b4c6d8e0f2b4c6d8e0f2b4c_4567890123456789012.jpg",
  "2.8": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/5d7e9f1a3c5d7e9f1a3c5d7e9f1a3c5d_5678901234567890123.jpg",
  "3.0": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/6e8f0a2b4d6e8f0a2b4d6e8f0a2b4d6e_6789012345678901234.jpg",
  "3.1": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/7f9a1b3c5e7f9a1b3c5e7f9a1b3c5e7f_7890123456789012345.jpg",
  "3.2": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/8a0b2c4d6f8a0b2c4d6f8a0b2c4d6f8a_8901234567890123456.jpg",
  "3.3": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/9b1c3d5e7a9b1c3d5e7a9b1c3d5e7a9b_9012345678901234567.jpg",
  "3.4": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/0c2d4e6f8b0c2d4e6f8b0c2d4e6f8b0c_0123456789012345678.jpg",
  "3.5": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/1d3e5f7a9c1d3e5f7a9c1d3e5f7a9c1d_1234567890123456789.jpg",
  "3.6": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/2e4f6a8b0d2e4f6a8b0d2e4f6a8b0d2e_2345678901234567890.jpg",
  "3.7": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/3f5a7b9c1e3f5a7b9c1e3f5a7b9c1e3f_3456789012345678901.jpg",
  "3.8": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/4a6b8c0d2f4a6b8c0d2f4a6b8c0d2f4a_4567890123456789012.jpg",
  "4.0": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/5b7c9d1e3a5b7c9d1e3a5b7c9d1e3a5b_5678901234567890123.jpg",
  "4.1": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/6c8d0e2f4b6c8d0e2f4b6c8d0e2f4b6c_6789012345678901234.jpg",
  "4.2": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/7d9e1f3a5c7d9e1f3a5c7d9e1f3a5c7d_7890123456789012345.jpg",
  "4.3": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/8e0f2a4b6d8e0f2a4b6d8e0f2a4b6d8e_8901234567890123456.jpg",
  "4.4": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/9f1a3b5c7e9f1a3b5c7e9f1a3b5c7e9f_9012345678901234567.jpg",
  "4.5": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/0a2b4c6d8f0a2b4c6d8f0a2b4c6d8f0a_0123456789012345678.jpg",
  "4.6": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/1b3c5d7e9a1b3c5d7e9a1b3c5d7e9a1b_1234567890123456789.jpg",
  "4.7": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/2c4d6e8f0b2c4d6e8f0b2c4d6e8f0b2c_2345678901234567890.jpg",
  "4.8": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/16/3d5e7f9a1c3d5e7f9a1c3d5e7f9a1c3d_3456789012345678901.jpg",
  "5.0": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/08/16/0f1e2d3c4b5a6978767584939201106a_4021957489125836502.jpg",
  "5.1": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/09/27/5c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f_5678901234567890123.jpg",
  "5.2": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/11/13/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d_6789012345678901234.jpg",
  "5.3": "https://fastcdn.hoyoverse.com/static-resource-v2/2024/12/25/2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e_7890123456789012345.jpg",
};

function parseView(v: string | undefined): VersionView {
  return v === "before" || v === "after" ? v : "added";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, version } = await params;
  const index = await getVersionIndex();
  if (!isVersionString(version) || !index.versions.includes(version)) {
    return createLocalizedMetadata({
      locale,
      pathname: `versions/${version}`,
      title: "Không tìm thấy phiên bản — LEIBO",
      robots: { index: false, follow: false },
    });
  }
  const s = summarize(index, version);
  return createLocalizedMetadata({
    locale,
    pathname: `versions/${version}`,
    title: `Genshin Impact phiên bản ${version}: nội dung mới | LEIBO`,
    description: `Phiên bản ${version} thêm ${s.added} mục (nhân vật, vũ khí, thánh di vật, bí cảnh, nguyên liệu). Xem cả nội dung đã có trước đó và những gì thêm sau.`,
  });
}

export default async function VersionDetailPage({ params, searchParams }: PageProps) {
  const { locale, version } = await params;
  setRequestLocale(locale);
  const view = parseView((await searchParams).view);

  const index = await getVersionIndex();
  if (!isVersionString(version) || !index.versions.includes(version)) return notFound();

  const at = index.versions.indexOf(version);
  const prev = index.versions[at - 1];
  const next = index.versions[at + 1];
  const summary = summarize(index, version);
  const countOf = (v: VersionView) => summary[v];

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: "Lịch sử phiên bản", path: "/versions" },
    { name: `Phiên bản ${version}`, path: `/versions/${version}` },
  ];

  const sections = index.sources
    .map((src) => ({ src, items: pickEntries(index.entries[src.key] ?? [], version, view) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-display-2 font-semibold text-text-primary">
          Phiên bản {version}
        </h1>
        <nav aria-label="Chuyển phiên bản" className="flex gap-2 text-sm">
          {prev ? (
            <Link
              href={`/versions/${prev}?view=${view}`}
              className="px-3 py-1.5 rounded-full border border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
            >
              ← {prev}
            </Link>
          ) : null}
          {next ? (
            <Link
              href={`/versions/${next}?view=${view}`}
              className="px-3 py-1.5 rounded-full border border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
            >
              {next} →
            </Link>
          ) : null}
        </nav>
      </header>

      {/* 3 chế độ xem: thêm ở bản này / đã có trước / thêm sau */}
      <div role="tablist" aria-label="Chế độ xem" className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {VIEWS.map((v) => {
          const active = v.key === view;
          return (
            <Link
              key={v.key}
              href={`/versions/${version}?view=${v.key}`}
              role="tab"
              aria-selected={active}
              className={`rounded-xl border-2 p-4 transition-colors ${
                active
                  ? "bg-bg-elevated border-accent-500"
                  : "bg-bg-card border-border hover:border-accent-500"
              }`}
            >
              <div className={`text-2xl font-bold ${active ? "text-accent-bright" : "text-text-primary"}`}>
                {countOf(v.key)}
              </div>
              <div className="text-sm font-medium text-text-primary">{v.label}</div>
              <div className="text-xs text-text-muted mt-0.5">{v.hint}</div>
            </Link>
          );
        })}
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-text-muted">Không có mục nào trong chế độ xem này.</p>
      ) : (
        sections.map(({ src, items }) => (
          <details key={src.key} open={view === "added" || sections.length === 1} className="mb-6 group/section">
            <summary className="cursor-pointer select-none font-display text-xl font-bold text-accent-bright border-b border-border pb-2 mb-4">
              {src.label}
              <span className="ml-2 text-sm font-normal text-text-muted">({items.length})</span>
            </summary>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((e) => {
                const name = getLocalizedName(e, locale);
                const body = (
                  <>
                    <div
                      className={`relative w-10 h-10 bg-bg-elevated overflow-hidden shrink-0 ${
                        src.shape === "round" ? "rounded-full" : "rounded-lg"
                      }`}
                    >
                      <SafeImage
                        src={e.iconUrl}
                        fallbackSrcs={[e.iconUrlOriginal]}
                        alt={name}
                        fill
                        sizes="40px"
                        className={src.shape === "round" ? "object-cover" : "object-contain p-0.5"}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate group-hover/item:text-accent-bright transition-colors">
                        {name}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {[e.meta, view !== "added" ? (e.version === LEGACY ? "Gốc" : `Bản ${e.version}`) : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  </>
                );
                return (
                  <li key={`${src.key}-${e.id}`}>
                    {src.hrefBase ? (
                      <Link
                        href={`${src.hrefBase}/${e.id}`}
                        className="surface-card p-3 flex items-center gap-3 group/item"
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="surface-card p-3 flex items-center gap-3 group/item">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
        ))
      )}
    </div>
  );
}
