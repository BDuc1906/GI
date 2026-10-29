"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";

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
    icon: "/local-genshin-assets/ui/condensed_resin.png",
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
    icon: "/local-genshin-assets/ui/primogem.png",
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

type CategoryFilter = "all" | "combat" | "world" | "profile";

export function TeyvatCompendium() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return COMPENDIUM_ITEMS;
    return COMPENDIUM_ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const categories = [
    { id: "all", label: "Tất cả danh mục", count: COMPENDIUM_ITEMS.length, icon: "/local-genshin-assets/ui/home.png" },
    { id: "combat", label: "Chiến Đấu & Trang Bị", count: COMPENDIUM_ITEMS.filter(i => i.category === "combat").length, icon: "/local-genshin-assets/ui/sword.png" },
    { id: "world", label: "Tài Nguyên & Thế Giới", count: COMPENDIUM_ITEMS.filter(i => i.category === "world").length, icon: "/local-genshin-assets/ui/resin.png" },
    { id: "profile", label: "Hồ Sơ & Hoạt Động", count: COMPENDIUM_ITEMS.filter(i => i.category === "profile").length, icon: "/local-genshin-assets/ui/achievement.png" },
  ] as const;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent-500" />
            <span className="text-xs font-mono uppercase tracking-wider text-accent-bright font-semibold">
              Bách Khoa Toàn Thư Teyvat
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Trung Tâm Cơ Sở Dữ Liệu Teyvat
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Tổng hợp toàn bộ hệ thống trang bị, sinh thái, tài nguyên và hồ sơ nhân vật trong trò chơi
          </p>
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
              <img src={cat.icon} alt="" width={16} height={16} className="w-4 h-4 object-contain shrink-0" />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                isActive ? "bg-bg-primary/20 text-bg-primary" : "bg-bg-card text-text-muted"
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Compendium Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredItems.map((item) =>
          item.href ? (
            <Link
              key={item.id}
              href={item.href}
              className="group relative flex flex-col justify-between p-4 rounded-xl bg-bg-card/75 border border-border/80 hover:border-accent-500/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-sm overflow-hidden"
              style={{
                borderColor: item.accentColor ? `color-mix(in srgb, ${item.accentColor} 30%, var(--border-color))` : undefined,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center p-1.5 border border-border/60 group-hover:scale-110 transition-transform duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.icon} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-bright border border-accent-500/25">
                    {item.tag}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-text-primary group-hover:text-accent-bright transition-colors mb-1 truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Bottom accent indicator */}
              <div
                className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[11px] text-text-muted group-hover:text-accent-bright transition-colors"
              >
                <span>Tra cứu dữ liệu</span>
                <span>&rarr;</span>
              </div>
            </Link>
          ) : (
            <div
              key={item.id}
              className="relative flex flex-col justify-between p-4 rounded-xl bg-bg-card/40 border border-border/40 opacity-55 cursor-not-allowed"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center p-1.5 border border-border/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.icon} alt="" width={24} height={24} className="w-6 h-6 object-contain opacity-60" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted border border-border/40">
                    {item.tag}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-text-muted mb-1 truncate">
                  {item.title}
                </h3>
                <p className="text-xs text-text-muted/70 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-border/20 text-[11px] text-text-muted/60">
                Đang biên soạn dữ liệu
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
