"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { SearchBar } from "@/features/search/components/SearchBar";
import { ThemeToggle } from "../ui/ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Header đầy đủ: logo + link điều hướng + [ngôn ngữ] + [search] + theme
 * toggle. Ngôn ngữ và search đều thu gọn thành icon — bấm vào mới bung ra
 * (dropdown / ô nhập) — để không chiếm chỗ ngang trên header, nhất là ở
 * các breakpoint hẹp.
 * Dưới breakpoint `md`, link điều hướng gộp vào menu hamburger để tránh
 * tràn ngang.
 */
export function SiteNav() {
  const t = useTranslations("Nav");
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV_LINKS = [
    { href: "/characters", label: t("characters"), icon: "/local-genshin-assets/ui/characters.png" },
    { href: "/weapons", label: t("weapons"), icon: "/local-genshin-assets/ui/sword.png" },
    { href: "/artifacts", label: t("artifacts"), icon: "/local-genshin-assets/ui/artifacts.png" },
    { href: "/domains", label: t("domains"), icon: "/local-genshin-assets/ui/domain.png" },
    { href: "/tools/team-builder", label: "Đội hình", icon: "/local-genshin-assets/ui/characters.png" },
    { href: "/calendar", label: "Lịch farm", icon: "/local-genshin-assets/ui/resin.png" },
  ];

  return (
    <header className="border-b border-border/80 sticky top-0 bg-bg-primary/85 backdrop-blur-md z-30 transition-colors">
      <nav className="flex items-center gap-4 px-4 md:px-8 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="group flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-500 group-hover:scale-125 transition-transform" />
            <span className="font-display text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#5eead4] via-[#f0ede0] to-[#e8774a]">
              LEIBO
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-bg-elevated/80 text-accent-bright border border-border/50 hidden sm:inline-block">
              WIKI
            </span>
          </Link>
          {/* Link điều hướng: ẩn dưới md, hiện dạng hàng ngang từ md trở lên */}
          <div className="hidden lg:flex items-center gap-4 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="group flex items-center gap-1.5 relative py-1 text-text-secondary hover:text-text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-500 hover:after:w-full after:transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={link.icon} alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Ngôn ngữ + search: cả hai đều icon, ngôn ngữ đứng TRƯỚC search.
            Hiện từ sm trở lên trên hàng chính; dưới sm chuyển xuống menu
            mobile để không bóp méo layout. */}
        <div className="hidden sm:flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          <SearchBar />
        </div>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
        </div>

        {/* Nút hamburger: chỉ hiện dưới md */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          aria-expanded={menuOpen}
          className="md:hidden px-3 py-1.5 text-sm rounded-lg border border-border text-text-primary hover:border-accent-500 transition-colors sm:ml-0 ml-auto"
        >
          {menuOpen ? t("closeMenu") : t("openMenu")}
        </button>
      </nav>

      {/* Panel mobile: link + search + theme toggle + ngôn ngữ gộp lại, chỉ render khi mở.
          Search/ngôn ngữ ở đây chỉ hiện dưới sm (sm:hidden) vì từ sm trở lên
          đã có icon tương ứng ngay trên hàng chính. */}
      {menuOpen && (
        <div className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-4 bg-bg-primary">
          <div className="sm:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <SearchBar />
          </div>
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 text-base hover:text-accent-bright transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={link.icon} alt="" width={20} height={20} className="w-5 h-5 object-contain shrink-0" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-text-secondary">{t("theme")}</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
