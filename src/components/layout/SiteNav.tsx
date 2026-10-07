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
    { href: "/characters", label: t("characters") },
    { href: "/weapons", label: t("weapons") },
    { href: "/artifacts", label: t("artifacts") },
    { href: "/domains", label: t("domains") },
    { href: "/elements", label: t("elements") },
  ];

  return (
    <header className="border-b border-border sticky top-0 bg-bg-primary/80 backdrop-blur-md z-20">
      <nav className="flex items-center gap-4 px-4 md:px-8 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="font-display text-xl font-bold tracking-wide text-accent-bright">
            LEIBO
          </Link>
          {/* Link điều hướng: ẩn dưới md, hiện dạng hàng ngang từ md trở lên */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent-bright transition-colors">
                {link.label}
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
                className="text-base hover:text-accent-bright transition-colors"
              >
                {link.label}
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
