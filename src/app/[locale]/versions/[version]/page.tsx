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
