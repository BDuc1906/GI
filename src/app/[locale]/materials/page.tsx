import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { SafeImage } from "@/components/ui/SafeImage";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

interface MaterialsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "materials");
}

/** Bỏ dấu + hạ chữ thường để tìm "dong" ra "Đồng", "ballad" ra "Ballad"... */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

export default async function MaterialsPage({ params, searchParams }: MaterialsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q = "" } = await searchParams;
  const query = normalize(q);

  const all = await withDbRetry(() =>
    prisma.material.findMany({
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
      orderBy: { name: "asc" },
    })
  );

  // Tìm theo tên tiếng Anh VÀ mọi bản dịch đã seed (565 dòng — lọc ở server là đủ nhanh).
  const materials = query
    ? all.filter((m) => {
        const translated = Object.values(
          (m.nameTranslations as Record<string, string> | null) ?? {}
        );
        return [m.name, ...translated].some((n) => normalize(String(n)).includes(query));
      })
    : all;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Nguyên liệu</h1>
        <p className="text-text-secondary mb-6">
          Danh sách nguyên liệu đột phá và nâng cấp. Bấm vào một nguyên liệu để xem farm ở đâu và ai
          cần dùng.
        </p>

        {/* Form GET thuần — không cần JS, vẫn hoạt động khi chưa hydrate */}
        <form action="" method="get" role="search" className="flex gap-2 mb-6 max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm nguyên liệu..."
            aria-label="Tìm nguyên liệu"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted"
          />
          <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
            Tìm
          </button>
        </form>

        <p className="text-sm text-text-muted mb-4" aria-live="polite">
          {query ? `${materials.length} kết quả cho "${q}"` : `${materials.length} nguyên liệu`}
        </p>

        {materials.length === 0 ? (
          <p className="text-text-secondary">Không tìm thấy nguyên liệu nào khớp.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {materials.map((material) => (
              <li key={material.id}>
                <Link
                  href={`/materials/${material.id}`}
                  className="block h-full bg-bg-card border-2 border-border rounded-xl p-4 hover:border-accent-500 transition-all text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-2 relative">
                    <SafeImage
                      src={material.iconUrl}
                      fallbackSrcs={[material.iconUrlOriginal]}
                      alt={getLocalizedName(material, locale)}
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-text-primary text-sm">
                    {getLocalizedName(material, locale)}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
