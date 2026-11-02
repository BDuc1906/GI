"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export interface CompendiumItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href?: string;
  tag: string;
  category: "combat" | "world" | "profile";
  accentColor?: string;
}

const COMPENDIUM_ITEMS: CompendiumItem[] = [
  // --- CHIẾN ĐẤU & TRANG BỊ ---
  {
    id: "characters",
    title: "Kho Nhân Vật",
    description: "Hệ thống nhân vật, thiên phú, cung mệnh & build khuyên dùng",
    icon: "/local-genshin-assets/ui/characters.png",
    href: "/characters",
    tag: "Đầy đủ",
    category: "combat",
    accentColor: "var(--el-anemo)",
  },
  {
    id: "weapons",
    title: "Kho Vũ Khí",
    description: "Chỉ số cơ bản, hiệu ứng vũ khí, đột phá & nhân vật phù hợp",
    icon: "/local-genshin-assets/ui/sword.png",
    href: "/weapons",
    tag: "180+ Món",
    category: "combat",
    accentColor: "var(--el-pyro)",
  },
  {
    id: "artifacts",
    title: "Thánh Di Vật",
    description: "Bộ 2 mảnh, 4 mảnh, domain rơi & bảng đề xuất trang bị",
    icon: "/local-genshin-assets/ui/artifacts.png",
    href: "/artifacts",
    tag: "Trang bị",
    category: "combat",
    accentColor: "var(--el-geo)",
  },
  {
    id: "enemies",
    title: "Kẻ Địch & Boss",
    description: "Boss tuần, Boss thế giới mở, kháng nguyên tố & vật phẩm rơi",
    icon: "/local-genshin-assets/ui/enemy.png",
    href: "/enemies",
    tag: "Chiến đấu",
    category: "combat",
    accentColor: "var(--el-hydro)",
  },
  {
    id: "domains",
    title: "Bí Cảnh & Khiêu Chiến",
    description: "Bí cảnh thánh di vật, sách thiên phú & nguyên liệu vũ khí",
    icon: "/local-genshin-assets/ui/domain.png",
    href: "/domains",
    tag: "Phụ bản",
    category: "combat",
    accentColor: "var(--el-electro)",
  },
  {
    id: "tcg",
    title: "Thất Thánh Triệu Hoán",
    description: "Thư viện thẻ bài, thẻ nhân vật & bộ bài chiến thuật Genius Invokation",
    icon: "/local-genshin-assets/ui/tcg.png",
    tag: "Sắp có",
    category: "combat",
    accentColor: "var(--el-dendro)",
  },
  {
    id: "elements",
    title: "Phản Ứng Nguyên Tố",
    description: "Bảng cơ chế khuếch đại, biến đổi & công thức tính sát thương 7 nguyên tố",
    icon: "/local-genshin-assets/ui/alchemy.png",
    href: "/elements",
    tag: "Cơ chế game",
    category: "combat",
    accentColor: "var(--el-pyro)",
  },

  // --- TÀI NGUYÊN & THẾ GIỚI ---
  {
    id: "calendar",
    title: "Lịch Farm Hàng Ngày",
    description: "Lịch mở bí cảnh sách thiên phú & phôi vũ khí theo thứ trong tuần",
    icon: "/local-genshin-assets/ui/resin.png",
    href: "/calendar",
    tag: "Thời gian thực",
    category: "world",
    accentColor: "var(--accent-bright)",
  },
  {
    id: "materials",
    title: "Kho Nguyên Liệu",
    description: "Đá đột phá, đặc sản địa phương, giọt quái & nguyên liệu rèn",
    icon: "/local-genshin-assets/ui/items.png",
    href: "/materials",
    tag: "500+ Loại",
    category: "world",
    accentColor: "var(--rarity-5)",
  },
  {
    id: "food",
    title: "Món Ăn & Ẩm Thực",
    description: "Công thức nấu ăn, món ăn đặc trưng nhân vật & buff chiến đấu",
    icon: "/local-genshin-assets/ui/food.png",
    href: "/food",
    tag: "Buff chỉ số",
    category: "world",
    accentColor: "var(--el-pyro)",
  },
  {
    id: "crafts",
    title: "Công Thức Chế Tạo",
    description: "Adventurer Handbook, bàn ghép giả kim & đài rèn vũ khí",
    icon: "/local-genshin-assets/ui/craft.png",
    href: "/crafts",
    tag: "Chế đồ",
    category: "world",
    accentColor: "var(--el-geo)",
  },
  {
    id: "animals",
    title: "Sinh Vật Teyvat",
    description: "Động vật hoang dã, chim thú & sinh vật bắt được bằng lưới",
    icon: "/local-genshin-assets/ui/animal.png",
    href: "/animals",
    tag: "Hệ sinh thái",
    category: "world",
    accentColor: "var(--el-dendro)",
  },
  {
    id: "geography",
    title: "Cảnh Quan Địa Lý",
    description: "Điểm ngắm cảnh, di tích và danh lam thắng cảnh 7 quốc gia",
    icon: "/local-genshin-assets/ui/geography.png",
    href: "/geography",
    tag: "Khám phá",
    category: "world",
    accentColor: "var(--el-anemo)",
  },

  // --- HỒ SƠ & HOẠT ĐỘNG ---
  {
    id: "achievements",
    title: "Thành Tựu Teyvat",
    description: "Theo dõi tiến độ hoàn thành thành tựu & tính toán Nguyên Thạch",
    icon: "/local-genshin-assets/ui/achievement.png",
    href: "/achievements",
    tag: "Nguyên Thạch",
    category: "profile",
    accentColor: "var(--rarity-5)",
  },
  {
    id: "hidden-achievements",
    title: "Thành Tựu Ẩn",
    description: "Bộ sưu tập thành tựu ẩn không xuất hiện sẵn trong game",
    icon: "/local-genshin-assets/ui/achievement.png",
    href: "/achievements/hidden",
    tag: "Bí mật",
    category: "profile",
    accentColor: "var(--rarity-5)",
  },
  {
    id: "namecards",
    title: "Thư Viện Danh Thiếp",
    description: "Danh thiếp nhân vật, thành tựu, sự kiện & danh thiếp danh vọng",
    icon: "/local-genshin-assets/ui/namecard.png",
    href: "/namecards",
    tag: "Trưng bày",
    category: "profile",
    accentColor: "var(--el-cryo)",
  },
  {
    id: "outfits",
    title: "Trang Phục Nhân Vật",
    description: "Bộ sưu tập trang phục thời trang, trang phục sự kiện & ký ức",
    icon: "/local-genshin-assets/ui/outfit.png",
    href: "/outfits",
    tag: "Ngoại trang",
    category: "profile",
    accentColor: "var(--el-electro)",
  },
  {
    id: "windgliders",
    title: "Bộ Sưu Tập Dù Lượn",
    description: "Dù lượn phong cách danh vọng từng quốc gia & sự kiện đặc biệt",
    icon: "/local-genshin-assets/ui/windglider.png",
    href: "/windgliders",
    tag: "Phong cách",
    category: "profile",
    accentColor: "var(--el-anemo)",
  },
  {
    id: "adventure-ranks",
    title: "Cấp Độ Mạo Hiểm",
    description: "Bảng phần thưởng Adventure Rank & cấp thế giới Teyvat",
    icon: "/local-genshin-assets/ui/ascension_star.png",
    href: "/adventure-ranks",
    tag: "Phần thưởng",
    category: "profile",
    accentColor: "var(--rarity-4)",
  },
  {
    id: "birthdays",
    title: "Lịch Sinh Nhật",
    description: "Ngày sinh nhật của các nhân vật theo từng tháng trong năm",
    icon: "/local-genshin-assets/ui/paimon_hello.png",
    href: "/birthdays",
    tag: "Thư quà",
    category: "profile",
    accentColor: "var(--accent-bright)",
  },
  {
    id: "versions",
    title: "Lịch Sử Phiên Bản",
    description: "Dòng thời gian cập nhật nội dung từ phiên bản 1.0 đến hiện tại",
    icon: "/local-genshin-assets/ui/timeline.png",
    href: "/versions",
    tag: "Dòng thời gian",
    category: "profile",
    accentColor: "var(--el-hydro)",
  },
  {
    id: "serenitea-pot",
    title: "Ấm Trần Ca",
    description: "Bản vẽ nội thất, bộ cảnh trí & năng lượng tiên lực ấm",
    icon: "/local-genshin-assets/ui/furnishing.png",
    tag: "Sắp có",
    category: "profile",
    accentColor: "var(--el-geo)",
  },
];

const AVAILABLE_ITEMS = COMPENDIUM_ITEMS.filter(
  (item): item is CompendiumItem & { href: string } => Boolean(item.href)
);

const ITEM_BACKGROUNDS: Record<string, string> = {
  characters: "/images/home-cards/characters.webp",
  weapons: "/images/home-cards/weapons.webp",
  artifacts: "/images/home-cards/artifacts.webp",
  enemies: "/images/home-cards/enemies.webp",
  domains: "/images/home-cards/domains.webp",
  elements: "/images/home-cards/elements.webp",
  calendar: "/images/home-cards/calendar.webp",
  materials: "/images/home-cards/materials.webp",
  food: "/images/home-cards/food.webp",
  crafts: "/images/home-cards/crafts.webp",
  animals: "/images/home-cards/animals.webp",
  geography: "/images/home-cards/geography.webp",
  achievements: "/images/home-cards/achievements.webp",
  "hidden-achievements": "/images/home-cards/hidden-achievements.webp",
  namecards: "/images/home-cards/namecards.webp",
  outfits: "/images/home-cards/outfits.webp",
  windgliders: "/images/home-cards/windgliders.webp",
  "adventure-ranks": "/images/home-cards/adventure-ranks.webp",
  birthdays: "/images/home-cards/birthdays.webp",
  versions: "/images/home-cards/versions.webp",
  "serenitea-pot": "/images/home-cards/serenitea-pot.webp",
};

type CategoryFilter = "all" | "combat" | "world" | "profile";

export function TeyvatCompendium() {
  const t = useTranslations();
  const tHome = useTranslations("Home");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("combat");

  const localizedItems: Record<string, { title: string; description: string }> = {
    characters: { title: t("Characters.title"), description: t("Characters.metaDescription") },
    weapons: { title: t("Weapons.title"), description: t("Weapons.metaDescription") },
    artifacts: { title: t("Artifacts.title"), description: t("Artifacts.metaDescription") },
    enemies: { title: t("Enemies.title"), description: t("Enemies.description") },
    domains: { title: t("Domains.title"), description: t("Domains.metaDescription") },
    elements: { title: t("Elements.title"), description: t("Elements.metaDescription") },
    materials: { title: t("Materials.title"), description: t("Materials.description") },
    food: { title: t("Food.title"), description: t("Food.description") },
    geography: { title: t("Geography.title"), description: t("Geography.description") },
    achievements: { title: t("Achievements.title"), description: t("Achievements.description") },
    "hidden-achievements": { title: tHome("cardHiddenAchievementsTitle"), description: tHome("cardHiddenAchievementsDescription") },
    calendar: { title: tHome("viewFullSchedule"), description: tHome("domainsToday") },
    versions: { title: t("Version.title"), description: tHome("viewAll") },
    tcg: { title: tHome("cardTcgTitle"), description: tHome("cardTcgDescription") },
    crafts: { title: tHome("cardCraftsTitle"), description: tHome("cardCraftsDescription") },
    animals: { title: tHome("cardAnimalsTitle"), description: tHome("cardAnimalsDescription") },
    namecards: { title: tHome("cardNamecardsTitle"), description: tHome("cardNamecardsDescription") },
    outfits: { title: tHome("cardOutfitsTitle"), description: tHome("cardOutfitsDescription") },
    windgliders: { title: tHome("cardWindglidersTitle"), description: tHome("cardWindglidersDescription") },
    "adventure-ranks": { title: tHome("cardAdventureRanksTitle"), description: tHome("cardAdventureRanksDescription") },
    birthdays: { title: tHome("cardBirthdaysTitle"), description: tHome("cardBirthdaysDescription") },
    "serenitea-pot": { title: tHome("cardSereniteaTitle"), description: tHome("cardSereniteaDescription") },
  };

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return AVAILABLE_ITEMS;
    return AVAILABLE_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const categories = [
    { id: "all", label: tHome("categoryAll"), count: AVAILABLE_ITEMS.length, icon: "/local-genshin-assets/ui/home.png" },
    { id: "combat", label: tHome("categoryCombat"), count: AVAILABLE_ITEMS.filter(i => i.category === "combat").length, icon: "/local-genshin-assets/ui/sword.png" },
    { id: "world", label: tHome("categoryWorld"), count: AVAILABLE_ITEMS.filter(i => i.category === "world").length, icon: "/local-genshin-assets/ui/resin.png" },
    { id: "profile", label: tHome("categoryProfile"), count: AVAILABLE_ITEMS.filter(i => i.category === "profile").length, icon: "/local-genshin-assets/ui/achievement.png" },
  ] as const;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            {t("Navigation.title")}
          </h2>
        </div>
      </div>

      {/* Category Tabs Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 rounded-xl bg-bg-card/70 border border-border/70 backdrop-blur-sm">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as CategoryFilter)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-accent-500 text-bg-primary shadow-sm"
                  : "bg-bg-elevated/50 text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-border/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.icon}
                alt=""
                width={16}
                height={16}
                className="w-4 h-4 object-contain shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <span>{cat.label}</span>
              <span className={`text-[10px] font-medium ${isActive ? "text-bg-primary/80" : "text-text-muted"}`}>
                ({cat.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Compendium Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group relative flex min-h-[112px] items-center justify-center rounded-xl bg-bg-card border border-border/80 p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden active:scale-[0.98] sm:min-h-[132px]"
              style={{
                borderColor: item.accentColor ? `color-mix(in srgb, ${item.accentColor} 30%, var(--border-color))` : undefined,
              }}
            >
              <Image
                src={ITEM_BACKGROUNDS[item.id] ?? item.icon}
                alt=""
                aria-hidden="true"
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="absolute inset-0 h-full w-full object-cover opacity-100 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/45 transition-colors group-hover:from-transparent group-hover:via-black/5 group-hover:to-black/40" />
              <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
              <div className="absolute left-2.5 top-2.5 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/50 p-2 backdrop-blur-sm shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.icon}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="relative z-10 max-w-full px-1 text-center">
                <h3 className="font-display text-sm font-bold leading-snug text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] transition-colors group-hover:text-accent-bright sm:text-base">
                  {localizedItems[item.id]?.title ?? item.title}
                </h3>
              </div>
              <div
                className="absolute inset-x-0 bottom-0 h-0.5 opacity-60 transition-opacity group-hover:opacity-100"
                style={{
                  backgroundColor: item.accentColor ?? "var(--accent-bright)",
                }}
              />
            </Link>
          ))}
      </div>
    </section>
  );
}
