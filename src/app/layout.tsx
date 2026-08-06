
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SiteNav } from "@/components/SiteNav";

// Cùng biến/fallback với sitemap.ts và robots.ts — một nguồn duy nhất cho
// domain thật, tránh lệch nhau giữa các file.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_TITLE = "LEIBO — Genshin Impact Database";
const SITE_DESCRIPTION = "Dữ liệu Genshin Impact: nhân vật, vũ khí, thánh di vật.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // Các trang con set metadata.title riêng (vd "Kazuha — LEIBO") sẽ tự
    // được chèn vào %s — không cần lặp lại "LEIBO" thủ công ở mỗi trang.
    template: "%s",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "LEIBO",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    // "summary_large_image" đúng chuẩn khi đã có ảnh 1200x630 thật (xem
    // app/opengraph-image.tsx, app/characters/[id]/opengraph-image.tsx) —
    // trước đây để "summary" (card nhỏ, không cần ảnh) vì lúc đó chưa có
    // ảnh OG nào để hiển thị.
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

// schema.org WebSite + SearchAction — cho phép Google hiển thị ô tìm kiếm
// ngay trong kết quả tìm kiếm ("Sitelinks Search Box") trỏ thẳng vào
// /search?q={từ khoá}, khớp đúng route thật của SearchPage
// (src/app/search/page.tsx). Đặt ở layout gốc vì đây là metadata cấp
// TOÀN site (1 site chỉ có 1 SearchAction), không phải cấp từng trang.
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_TITLE,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
        <ThemeProvider>
          <SiteNav />
          <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-border mt-8">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 text-center text-xs text-[color:var(--text-muted)]">
              LEIBO là trang web phi lợi nhuận do fan thực hiện, không liên
              kết chính thức với miHoYo/HoYoverse. Genshin Impact và toàn bộ
              dữ liệu, hình ảnh liên quan thuộc bản quyền của{" "}
              <a
                href="https://www.hoyoverse.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[color:var(--gold-bright)] transition-colors"
              >
                miHoYo / HoYoverse
              </a>
              .
              <br />
              <Link href="/privacy" className="underline hover:text-[color:var(--gold-bright)] transition-colors">
                Quyền riêng tư
              </Link>
              {" · "}
              <Link href="/terms" className="underline hover:text-[color:var(--gold-bright)] transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
