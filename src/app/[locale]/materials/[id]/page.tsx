import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { SafeImage } from "@/components/ui/SafeImage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { ENEMY_TYPE_LABEL, readEnemyRaw } from "@/lib/game/enemy-format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

type MaterialRef = { materialId?: string | null };
type PhaseLike = { materials?: MaterialRef[] | null };

/** Json cột ascensionMaterials / talentMaterials: mảng các giai đoạn, mỗi giai đoạn có materials[]. */
function usesMaterial(json: unknown, materialId: string): boolean {
  if (!Array.isArray(json)) return false;
  return (json as PhaseLike[]).some((phase) =>
    (phase?.materials ?? []).some((m) => m?.materialId === materialId)
  );
}

const CATEGORY_LABEL_VI: Record<string, string> = {
  talent: "Sách thiên phú",
  weapon: "Nguyên liệu vũ khí",
  artifact: "Thánh di vật",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const m = await prisma.material.findUnique({
    where: { id },
    select: { id: true, name: true, nameTranslations: true },
  });
  if (!m) {
    return createLocalizedMetadata({
      locale,
      pathname: `materials/${id}`,
      title: "Không tìm thấy nguyên liệu — LEIBO",
      robots: { index: false, follow: false },
    });
  }
  const name = getLocalizedName(m, locale);
  return createLocalizedMetadata({
    locale,
    pathname: `materials/${id}`,
    title: `${name} — Nguyên liệu Genshin Impact | LEIBO`,
    description: `${name}: farm ở bí cảnh nào, nhân vật và vũ khí nào cần dùng.`,
  });
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // Chọn field tường minh (xem ghi chú ở domains/[id]/page.tsx về Prisma 7).
  const material = await withDbRetry(() =>
    prisma.material.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        iconUrl: true,
        iconUrlOriginal: true,
        gameVersion: true,
      },
    })
  );
  if (!material) return notFound();

  // Dữ liệu tham chiếu nằm trong cột Json nên lọc ở tầng ứng dụng (≈ 70 bí cảnh,
  // ≈ 120 nhân vật, ≈ 250 vũ khí — nhỏ, và chỉ select cột cần thiết).
  const [domainRows, characterRows, weaponRows, enemyRows] = await withDbRetry(() =>
    Promise.all([
      prisma.domain.findMany({
        select: {
          id: true,
          name: true,
          nameTranslations: true,
          category: true,
          regionName: true,
          daysOfWeek: true,
          materials: true,
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.character.findMany({
        select: {
          id: true,
          name: true,
          nameTranslations: true,
          iconUrl: true,
          iconUrlOriginal: true,
          rarity: true,
          ascensionMaterials: true,
          talentMaterials: true,
        },
        orderBy: [{ rarity: "desc" }, { name: "asc" }],
      }),
      prisma.weapon.findMany({
        select: {
          id: true,
          name: true,
          nameTranslations: true,
          iconUrl: true,
          iconUrlOriginal: true,
          rarity: true,
          ascensionMaterials: true,
        },
        orderBy: [{ rarity: "desc" }, { name: "asc" }],
      }),
      prisma.enemy.findMany({
        select: { id: true, name: true, enemyType: true, raw: true },
        orderBy: { name: "asc" },
      }),
    ])
  );

  const domains = domainRows.filter((d) => usesMaterial([{ materials: d.materials as MaterialRef[] }], id));
  const characters = characterRows
    .map((c) => ({
      ...c,
      forAscension: usesMaterial(c.ascensionMaterials, id),
      forTalent: usesMaterial(c.talentMaterials, id),
    }))
    .filter((c) => c.forAscension || c.forTalent);
  const weapons = weaponRows.filter((w) => usesMaterial(w.ascensionMaterials, id));
  // Kẻ địch rớt nguyên liệu này: khớp theo tên trong rewardPreview của genshin-db.
  const enemies = enemyRows.filter((e) =>
    (readEnemyRaw(e.raw).rewardPreview ?? []).some((r) => r.name === material.name)
  );

  const name = getLocalizedName(material, locale);
  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: "Nguyên liệu", path: "/materials" },
    { name, path: `/materials/${material.id}` },
  ];

  const isEmpty = domains.length + enemies.length + characters.length + weapons.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <header className="flex items-center gap-4 mb-8">
        <div className="relative w-20 h-20 rounded-xl bg-bg-elevated shrink-0 overflow-hidden">
          <SafeImage
            src={material.iconUrl}
            fallbackSrcs={[material.iconUrlOriginal]}
            alt={name}
            fill
            sizes="80px"
            className="object-contain p-1.5"
            priority
          />
        </div>
        <div>
          <h1 className="font-display text-display-2 font-semibold text-text-primary">{name}</h1>
          {name !== material.name && (
            <p className="text-sm text-text-muted">{material.name}</p>
          )}
          {material.gameVersion ? (
            <p className="text-sm text-text-secondary mt-1">
              Thêm ở{" "}
              <Link
                href={`/versions/${material.gameVersion}`}
                className="underline hover:text-accent-bright"
              >
                phiên bản {material.gameVersion}
              </Link>
            </p>
          ) : material.gameVersion === "" ? (
            <p className="text-sm text-text-muted mt-1">Nội dung gốc (chưa có mốc phiên bản cụ thể)</p>
          ) : null}
        </div>
      </header>

      {isEmpty && (
        <p className="text-sm text-text-muted mb-8">
          Chưa có dữ liệu bí cảnh hay nhân vật/vũ khí nào tham chiếu nguyên liệu này.
        </p>
      )}

      {domains.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Farm ở đâu
            <span className="ml-2 text-sm font-normal text-text-muted">({domains.length})</span>
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {domains.map((d) => (
              <li key={d.id}>
                <Link href={`/domains/${d.id}`} className="surface-card p-3 block group">
                  <div className="font-semibold text-text-primary group-hover:text-accent-bright transition-colors">
                    {getLocalizedName(d, locale)}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {CATEGORY_LABEL_VI[d.category] ?? d.category}
                    {d.regionName ? ` · ${d.regionName}` : ""}
                    {d.daysOfWeek.length > 0 ? ` · ${d.daysOfWeek.length} ngày/tuần` : " · Hằng ngày"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-muted mt-3">
            Xem ngày mở cụ thể ở <Link href="/calendar" className="underline hover:text-accent-bright">Lịch farm</Link>.
          </p>
        </section>
      )}

      {enemies.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Rớt từ kẻ địch
            <span className="ml-2 text-sm font-normal text-text-muted">({enemies.length})</span>
          </h2>
          <ul className="flex flex-wrap gap-2">
            {enemies.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/enemies/${e.id}`}
                  className="inline-block px-3 py-1 rounded-full border border-border text-sm text-text-secondary hover:border-accent-500 hover:text-accent-bright"
                >
                  {e.name}
                  {e.enemyType && e.enemyType !== "COMMON" ? ` · ${ENEMY_TYPE_LABEL[e.enemyType] ?? e.enemyType}` : ""}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {characters.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Nhân vật cần dùng
            <span className="ml-2 text-sm font-normal text-text-muted">({characters.length})</span>
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {characters.map((c) => (
              <li key={c.id}>
                <Link href={`/characters/${c.id}`} className="surface-card p-3 flex items-center gap-3 group">
                  <div className="relative w-10 h-10 rounded-full bg-bg-elevated overflow-hidden shrink-0">
                    <SafeImage
                      src={c.iconUrl}
                      fallbackSrcs={[c.iconUrlOriginal]}
                      alt={getLocalizedName(c, locale)}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-bright transition-colors">
                      {getLocalizedName(c, locale)}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {[c.forAscension && "Đột phá", c.forTalent && "Thiên phú"].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {weapons.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Vũ khí cần dùng
            <span className="ml-2 text-sm font-normal text-text-muted">({weapons.length})</span>
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {weapons.map((w) => (
              <li key={w.id}>
                <Link href={`/weapons/${w.id}`} className="surface-card p-3 flex items-center gap-3 group">
                  <div className="relative w-10 h-10 rounded-lg bg-bg-elevated overflow-hidden shrink-0">
                    <SafeImage
                      src={w.iconUrl}
                      fallbackSrcs={[w.iconUrlOriginal]}
                      alt={getLocalizedName(w, locale)}
                      fill
                      sizes="40px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-bright transition-colors">
                    {getLocalizedName(w, locale)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
