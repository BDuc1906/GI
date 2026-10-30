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

        {/* Dark/Light toggle + Ngôn ngữ + Search */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="hidden sm:flex items-center gap-1.5">
            <LanguageSwitcher />
            <SearchBar />
          </div>
          <ThemeToggle />

          {/* Nút hamburger 3 gạch: hiện trên mobile & tablet (< lg) */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            aria-expanded={menuOpen}
            className="lg:hidden p-2 rounded-lg border border-border bg-bg-elevated/40 text-text-primary hover:text-accent-bright hover:border-accent-500 transition-colors flex items-center justify-center shrink-0"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Panel mobile: link + search + ngôn ngữ gộp lại, chỉ render khi mở. */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border px-4 py-4 flex flex-col gap-3.5 bg-bg-primary/95 backdrop-blur-md shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* Quick controls on mobile (< sm): Language & Search */}
          <div className="sm:hidden flex items-center justify-between gap-2 pb-2.5 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-medium">Ngôn ngữ:</span>
              <LanguageSwitcher />
            </div>
            <div className="flex items-center">
              <SearchBar />
            </div>
          </div>

          {/* Nav links dạng danh sách thẻ bấm lớn, tối ưu mọi màn hình điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-bg-elevated/40 hover:bg-bg-elevated hover:border-accent-500/50 text-text-primary hover:text-accent-bright transition-all group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={link.icon}
                  alt=""
                  width={22}
                  height={22}
                  className="w-[22px] h-[22px] object-contain shrink-0 group-hover:scale-110 transition-transform"
                />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
