"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/characters", label: "Nhân vật" },
  { href: "/weapons", label: "Vũ khí" },
  { href: "/artifacts", label: "Thánh di vật" },
  { href: "/domains", label: "Bí cảnh" },
];

/**
 * Header đầy đủ: logo + link điều hướng + search + theme toggle.
 * Dưới breakpoint `md`, link điều hướng gộp vào menu hamburger để tránh
 * tràn ngang — trước đây "flex items-center gap-4" không wrap, trên màn
 * hình điện thoại (~360-390px) 3 link + SearchBar + ThemeToggle không đủ
 * chỗ, chữ bị chèn/tràn.
 */
export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border sticky top-0 bg-primary/80 backdrop-blur-md z-20">
      <nav className="flex items-center gap-4 px-4 md:px-8 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="font-display text-xl font-bold tracking-wide text-amber-500">
            LEIBO
          </Link>
          {/* Link điều hướng: ẩn dưới md, hiện dạng hàng ngang từ md trở lên */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-amber-400 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Search chỉ hiện từ sm trở lên trên hàng chính; dưới sm chuyển
            xuống hàng riêng bên trong menu mobile để không bóp méo layout.
            "ml-auto max-w-xs" đặt ở đây (không phải trong SearchBar) để
            component có thể tái dùng full-width trong menu mobile bên dưới. */}
        <div className="hidden sm:block flex-1 max-w-xs ml-auto">
          <SearchBar />
        </div>

        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* Nút hamburger: chỉ hiện dưới md */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
          className="md:hidden ml-auto p-2 rounded-lg border border-border text-primary hover:border-amber-400 transition-colors"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Panel mobile: link + search + theme toggle gộp lại, chỉ render khi mở */}
      {menuOpen && (
        <div className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-4 bg-primary">
          <div className="sm:hidden">
            <SearchBar />
          </div>
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-base hover:text-amber-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-sm text-secondary">Giao diện</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}