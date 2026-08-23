import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "../../lib/prisma";
import { ElementIcon } from "../../components/ElementIcon";
import { HomeHero } from "../../components/HomeHero";
import { ScrollReveal } from "../../components/ScrollReveal";
import { EntityCard } from "../../components/EntityCard";
import { elementColorVar } from "../../lib/theme";
import { genshinServerWeekdayIndex } from "../../lib/genshin-server-time";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const WEEKDAY_KEYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function SectionHeader({ title, href, viewAllLabel }: { title: string; href: string; viewAllLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-display text-display-2 font-semibold text-text-primary">{title}</h2>
      <Link href={href} className="text-sm text-text-secondary hover:text-accent-bright transition-colors flex items-center gap-1">
        {viewAllLabel} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });

  const CATEGORY_LABEL: Record<string, string> = {
    artifact: t("categoryArtifact"),
    weapon: t("categoryWeaponMaterial"),
    talent: t("categoryTalentBook"),
  };

  const [charCount, weaponCount, artifactCount] = await Promise.all([
    prisma.character.count(),
    prisma.weapon.count(),
    prisma.artifactSet.count(),
  ]);

  const latestCharacters = await prisma.character.findMany({
    // 9 item = 1 tile 2x2 (4 đơn vị) + 8 tile đơn (8 đơn vị) = 12 đơn vị
    // diện tích, chia hết cho mọi mốc cột đang dùng (2/3/4/6) → lưới bento
    // luôn kín khít, không hở ô ở bất kỳ kích thước màn hình nào.
    take: 9,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, vision: true, weaponType: true, rarity: true, iconUrl: true, elementIcon: true },
  });

  const latestWeapons = await prisma.weapon.findMany({
    take: 6,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, type: true, rarity: true, iconUrl: true },
  });

  // Bí cảnh mở hôm nay — cùng logic "giờ server + mốc đổi ngày 4h sáng" với
  // trang /domains, để banner trang chủ và trang lịch bí cảnh luôn khớp
  // nhau (không phải dữ liệu trang trí, đúng danh sách hôm nay mở).
  const todayKey = WEEKDAY_KEYS[genshinServerWeekdayIndex()];
  const domainsToday = await prisma.domain.findMany({
    where: { OR: [{ daysOfWeek: { isEmpty: true } }, { daysOfWeek: { has: todayKey } }] },
    orderBy: { category: "asc" },
    select: { id: true, name: true, category: true },
    take: 6,
  });

  const stats = [
    { label: t("statCharacters"), count: charCount },
    { label: t("statWeapons"), count: weaponCount },
    { label: t("statArtifacts"), count: artifactCount },
  ];

  return (
    <div className="relative min-h-screen">
      <HomeHero stats={stats} />

      <ScrollReveal>
        <section className="mb-10 mt-4">
          <SectionHeader title={t("latestCharacters")} href="/characters" viewAllLabel={t("viewAll")} />
          {/* Bố cục bento: nhân vật mới nhất chiếm ô 2x2 nổi bật, 5 nhân vật
              còn lại xếp icon nhỏ xung quanh — thay cho lưới đều tăm tắp
              trước đây, tạo phân cấp thị giác ngay từ ô đầu tiên. */}
          {/* grid-flow-row-dense: an toàn dự phòng nếu sau này đổi "take"
              mà quên tính lại chia hết cho các mốc cột. Card KHÔNG bọc
              thêm <div> — EntityCard tự nhận wrapperClassName để chính
              nó là grid item, "h-full" mới stretch đúng theo track (xem
              comment trong EntityCard.tsx). */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 grid-flow-row-dense">
            {latestCharacters.map((c, index) => (
              <EntityCard
                key={c.id}
                href={`/characters/${c.id}`}
                name={c.name}
                subtitle={c.weaponType}
                rarity={c.rarity}
                imageSrc={c.iconUrl}
                imageFit="contain"
                priority={index < 6}
                elementColor={elementColorVar(c.vision)}
                cornerBadge={<ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={index === 0 ? 20 : 16} />}
                wrapperClassName={index === 0 ? "col-span-2 row-span-2" : undefined}
                imageGrow={index === 0}
                // Tile 2x2 to gấp ~3 lần card thường — sizes mặc định (thiết
                // kế cho ~130px) sẽ khiến Next/Image chọn nhầm ảnh độ phân
                // giải thấp rồi CSS phóng to, gây mờ/vỡ hạt như ảnh chụp bạn
                // gửi. Khớp gần đúng theo % chiều rộng khung 2 cột thật.
                sizes={
                  index === 0
                    ? "(max-width: 640px) 100vw, (max-width: 768px) 66vw, (max-width: 1024px) 50vw, 420px"
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      </ScrollReveal>

      {domainsToday.length > 0 && (
        <ScrollReveal delay={80}>
          <section className="mb-10">
            <div className="surface-glass border border-border rounded-xl px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-accent-bright" aria-hidden />
                <span className="text-eyebrow text-accent-bright">{t("domainsToday")}</span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 flex-1 min-w-0">
                {domainsToday.map((d) => (
                  <Link
                    key={d.id}
                    href={`/domains/${d.id}`}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-[10px] text-text-muted uppercase tracking-wide">
                      {CATEGORY_LABEL[d.category] ?? d.category}
                    </span>
                    {d.name}
                  </Link>
                ))}
              </div>
              <Link href="/domains" className="text-xs text-text-muted hover:text-text-primary transition-colors shrink-0 underline underline-offset-2">
                {t("viewFullSchedule")} →
              </Link>
            </div>
          </section>
        </ScrollReveal>
      )}

      <ScrollReveal delay={140}>
        <section>
          <SectionHeader title={t("latestWeapons")} href="/weapons" viewAllLabel={t("viewAll")} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {latestWeapons.map((w) => (
              <EntityCard
                key={w.id}
                href={`/weapons/${w.id}`}
                name={w.name}
                subtitle={w.type}
                rarity={w.rarity}
                imageSrc={w.iconUrl}
                imageFit="contain"
              />
            ))}
          </div>
        </section>
      </ScrollReveal>

      <footer className="mt-20 pt-8 border-t border-border text-center text-xs text-text-muted">
        <p>{t("footerNote")}</p>
      </footer>
    </div>
  );
}
