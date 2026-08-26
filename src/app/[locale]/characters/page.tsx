import Link from "next/link";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { ElementIcon } from "@/components/character/ElementIcon";
import { WeaponIcon } from "@/components/weapon/WeaponIcon";
import { EntityCard } from "@/components/ui/EntityCard";
import { rarityStars, elementColorVar } from "@/lib/ui/theme";
import { resolveCharacterCardImage } from "@/lib/game/character-helpers";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Characters" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

const getVisionRows = unstable_cache(
  async () => {
    const rows = await prisma.character.findMany({
      distinct: ["vision"],
      select: { vision: true, elementIcon: true },
    });
    return rows
      .filter((r) => r.vision && r.vision !== "Unknown")
      .map((r) => ({ vision: r.vision, elementIcon: r.elementIcon }));
  },
  ["character-vision-rows-v3"],
  { revalidate: 3600 }
);

const getRegionRows = unstable_cache(
  async () => {
    const rows = await prisma.character.findMany({ distinct: ["region"], select: { region: true } });
    return rows.map((r) => r.region).filter((r): r is string => Boolean(r));
  },
  ["character-region-rows"],
  { revalidate: 3600 }
);

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vision?: string; weapon?: string; region?: string; rarity?: string; q?: string }>;
}

function parseMulti(value?: string): string[] {
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function toggleValue(current: string[], value: string): string[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

/** Một nhóm bộ lọc — label cố định bên trái, chip cuộn ngang trên mobile
 *  thay vì wrap tự do, để 4 nhóm liên tiếp không biến thành khối dài vô tận. */
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-b-0">
      <span className="text-xs text-text-muted font-medium w-24 shrink-0 pt-1.5">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

/** Class grid dùng chung cho cả nhóm Traveler và mọi nhóm rarity — mật độ
 *  cao hơn bản cũ (dừng ở lg:6), tận dụng màn hình rộng thay vì để card
 *  giãn to vô lý. Đi kèm compact=true trên EntityCard (icon vuông, không
 *  tilt, text rút gọn) để phù hợp số lượng card lớn trên 1 màn hình. */
const DENSE_GRID = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3";

export default async function CharactersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  // Bắt buộc gọi lại ở mỗi page (không chỉ [locale]/layout.tsx) khi dùng
  // static rendering — nếu không, locale có thể "lẫn" giữa các bản build
  // song song của nhiều ngôn ngữ, khiến trang luôn hiện 1 ngôn ngữ cố định
  // (đây chính là nguyên nhân toàn bộ nội dung trang này bị hardcode
  // tiếng Việt trước khi sửa).
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Characters" });

  const { vision, weapon, region, rarity, q } = await searchParams;

  const visionList = parseMulti(vision);
  const weaponList = parseMulti(weapon);
  const regionList = parseMulti(region);
  const rarityList = parseMulti(rarity).map(Number).filter((n) => !Number.isNaN(n));

  const where: Prisma.CharacterWhereInput = {};
  if (visionList.length > 0) where.vision = { in: visionList, mode: "insensitive" };
  if (weaponList.length > 0) where.weaponType = { in: weaponList, mode: "insensitive" };
  if (regionList.length > 0) where.region = { in: regionList, mode: "insensitive" };
  if (rarityList.length > 0) where.rarity = { in: rarityList };
  if (q) where.name = { contains: q, mode: "insensitive" };

  // BUG ĐÃ SỬA: query chính của trang (chạy trên MỌI request, không có
  // cache) trước đây không có retry — cùng lớp lỗi PrismaClientKnownRequestError
  // P1017 "Server has closed the connection" đã sửa ở trang chủ, xảy ra
  // khi Neon free tier vừa suspend compute xong đúng lúc request tới.
  const characters = await withDbRetry(() =>
    prisma.character.findMany({
      where,
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
    })
  );

  const travelerByElement = new Map<string, { boy?: (typeof characters)[number]; girl?: (typeof characters)[number] }>();
  const nonTraveler: typeof characters = [];
  for (const c of characters) {
    if (c.id.startsWith("traveler-boy-")) {
      const bucket = travelerByElement.get(c.vision) ?? {};
      bucket.boy = c;
      travelerByElement.set(c.vision, bucket);
    } else if (c.id.startsWith("traveler-girl-")) {
      const bucket = travelerByElement.get(c.vision) ?? {};
      bucket.girl = c;
      travelerByElement.set(c.vision, bucket);
    } else {
      nonTraveler.push(c);
    }
  }

  // Nhóm nhân vật thường theo rarity — dùng để chèn tiêu đề sticky "★★★★★"
  // giữa các nhóm, thay vì để ranh giới 5★/4★ vô hình như bản cũ.
  const rarityGroups = new Map<number, typeof nonTraveler>();
  for (const c of nonTraveler) {
    const list = rarityGroups.get(c.rarity) ?? [];
    list.push(c);
    rarityGroups.set(c.rarity, list);
  }
  const sortedRarities = Array.from(rarityGroups.keys()).sort((a, b) => b - a);
  const hasResults = nonTraveler.length > 0 || travelerByElement.size > 0;

  const visionRows = await getVisionRows();
  const regionRows = await getRegionRows();
  const weapons = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];
  const hasActiveFilters = visionList.length || weaponList.length || regionList.length || rarityList.length || q;

  const buildQuery = (
    changes: Partial<Record<"vision" | "weapon" | "region" | "rarity", string>>,
    opts: { toggle?: boolean } = {}
  ) => {
    const sp = new URLSearchParams();
    let nextVision = visionList;
    let nextWeapon = weaponList;
    let nextRegion = regionList;
    let nextRarity = rarityList.map(String);

    if (changes.vision !== undefined) nextVision = opts.toggle ? toggleValue(visionList, changes.vision) : parseMulti(changes.vision);
    if (changes.weapon !== undefined) nextWeapon = opts.toggle ? toggleValue(weaponList, changes.weapon) : parseMulti(changes.weapon);
    if (changes.region !== undefined) nextRegion = opts.toggle ? toggleValue(regionList, changes.region) : parseMulti(changes.region);
    if (changes.rarity !== undefined) nextRarity = opts.toggle ? toggleValue(rarityList.map(String), changes.rarity) : parseMulti(changes.rarity);

    if (nextVision.length > 0) sp.set("vision", nextVision.join(","));
    if (nextWeapon.length > 0) sp.set("weapon", nextWeapon.join(","));
    if (nextRegion.length > 0) sp.set("region", nextRegion.join(","));
    if (nextRarity.length > 0) sp.set("rarity", nextRarity.join(","));
    if (q) sp.set("q", q);
    return sp.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-7">
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">{t("title")}</h1>
        <p className="text-sm text-text-secondary">
          {t.rich("foundCount", {
            count: nonTraveler.length + travelerByElement.size,
            b: (chunks) => <span className="text-accent-bright font-semibold">{chunks}</span>,
          })}
        </p>
      </div>

      <form method="GET" className="flex gap-2 mb-5">
        {visionList.length > 0 && <input type="hidden" name="vision" value={visionList.join(",")} />}
        {weaponList.length > 0 && <input type="hidden" name="weapon" value={weaponList.join(",")} />}
        {regionList.length > 0 && <input type="hidden" name="region" value={regionList.join(",")} />}
        {rarityList.length > 0 && <input type="hidden" name="rarity" value={rarityList.join(",")} />}
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder={t("searchPlaceholder")}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
        />
        <button type="submit" className="btn-accent rounded-lg px-4 py-2 text-sm">
          {t("searchButton")}
        </button>
      </form>

      <div className="surface-glass border border-border rounded-xl mb-8 px-4">
        <FilterGroup label={t("filterVision")}>
          {visionRows.map(({ vision: v, elementIcon }) => {
            const active = visionList.includes(v);
            return (
              <Link
                key={v}
                href={`/characters?${buildQuery({ vision: v }, { toggle: true })}`}
                aria-pressed={active}
                className="chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs"
              >
                <ElementIcon vision={v} iconUrl={elementIcon} size={14} />
                {v}
              </Link>
            );
          })}
        </FilterGroup>

        <FilterGroup label={t("filterWeapon")}>
          {weapons.map((w) => {
            const active = weaponList.includes(w);
            return (
              <Link
                key={w}
                href={`/characters?${buildQuery({ weapon: w }, { toggle: true })}`}
                aria-pressed={active}
                className="chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs"
              >
                <WeaponIcon type={w} size={14} />
                {w}
              </Link>
            );
          })}
        </FilterGroup>

        <FilterGroup label={t("filterRegion")}>
          {regionRows.map((r) => {
            const active = regionList.includes(r);
            return (
              <Link
                key={r}
                href={`/characters?${buildQuery({ region: r }, { toggle: true })}`}
                aria-pressed={active}
                className="chip px-2.5 py-1 rounded-full text-xs"
              >
                {r}
              </Link>
            );
          })}
        </FilterGroup>

        <FilterGroup label={t("filterRarity")}>
          {[5, 4].map((r) => {
            const active = rarityList.includes(r);
            return (
              <Link
                key={r}
                href={`/characters?${buildQuery({ rarity: String(r) }, { toggle: true })}`}
                aria-pressed={active}
                className="chip px-2.5 py-1 rounded-full text-xs text-[color:var(--rarity-5)] font-semibold"
              >
                {rarityStars(r)}
              </Link>
            );
          })}
          {hasActiveFilters && (
            <Link
              href="/characters"
              className="ml-auto text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
            >
              {t("clearAllFilters")}
            </Link>
          )}
        </FilterGroup>
      </div>

      {!hasResults ? (
        <div className="text-center py-20 text-text-muted text-sm">
          {t("noResults")}{" "}
          <Link href="/characters" className="underline underline-offset-2 hover:text-text-primary">
            {t("clearFilters")}
          </Link>
        </div>
      ) : (
        <>
          {travelerByElement.size > 0 && (
            <div className={`${DENSE_GRID} mb-8`}>
              {Array.from(travelerByElement.entries()).map(([el, { boy, girl }], index) => {
                const target = boy ?? girl!;
                const boyImg = boy ? resolveCharacterCardImage(boy) : null;
                const girlImg = girl ? resolveCharacterCardImage(girl) : null;
                return (
                  <EntityCard
                    key={`traveler-${el}`}
                    href={`/characters/${target.id}`}
                    // "Traveler (Anemo)" v.v. — tên ghép cứng ở đây, KHÔNG
                    // qua getLocalizedName (Character.name của 2 dòng
                    // "Traveler (Boy/Girl)" trong DB không phải tên hiển
                    // thị thật, chỉ dùng để phân biệt nội bộ).
                    name={`Traveler (${el})`}
                    subtitle="Sword"
                    rarity={target.rarity}
                    imageSrc={boyImg || girlImg}
                    aspect="square"
                    imageFit="contain"
                    compact
                    priority={index < 10}
                    elementColor={elementColorVar(el)}
                    cornerBadge={<ElementIcon vision={el} iconUrl={target.elementIcon} size={14} />}
                  />
                );
              })}
            </div>
          )}

          {sortedRarities.map((r) => (
            <div key={r} className="mb-8">
              {/* Tiêu đề nhóm rarity — sticky để không mất mốc khi cuộn dài,
                  thay cho ranh giới 5★/4★ vô hình như bản cũ. */}
              <div
                className="sticky top-0 z-10 bg-bg-primary/90 backdrop-blur-sm py-2 mb-3 text-xs font-semibold tracking-wide"
                style={{ color: `var(--rarity-${r >= 5 ? 5 : r === 4 ? 4 : 3})` }}
              >
                {rarityStars(r)} · {t("rarityGroupCount", { count: rarityGroups.get(r)!.length })}
              </div>
              <div className={DENSE_GRID}>
                {rarityGroups.get(r)!.map((c, index) => (
                  <EntityCard
                    key={c.id}
                    href={`/characters/${c.id}`}
                    name={getLocalizedName(c, locale)}
                    subtitle={c.weaponType}
                    rarity={c.rarity}
                    imageSrc={resolveCharacterCardImage(c)}
                    aspect="square"
                    imageFit="contain"
                    compact
                    priority={index < 10}
                    elementColor={elementColorVar(c.vision)}
                    cornerBadge={<ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={14} />}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
