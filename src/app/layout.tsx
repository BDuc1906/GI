import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchBar } from "@/components/SearchBar";

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
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="border-b border-border sticky top-0 bg-primary/80 backdrop-blur-md z-10">
            <nav className="flex items-center gap-4 px-4 md:px-8 py-3 max-w-7xl mx-auto">
              <div className="flex items-center gap-6 shrink-0">
                <Link href="/" className="font-display text-xl font-bold tracking-wide text-amber-500">
                  LEIBO
                </Link>
                <Link href="/characters" className="hover:text-amber-400 transition-colors">Nhân vật</Link>
                <Link href="/weapons" className="hover:text-amber-400 transition-colors">Vũ khí</Link>
                <Link href="/artifacts" className="hover:text-amber-400 transition-colors">Thánh di vật</Link>
              </div>
              {/* SearchBar tự có class "ml-auto" nên đẩy nó + ThemeToggle sang phải,
                  không cần justify-between trên <nav> nữa. */}
              <SearchBar />
              <ThemeToggle />
            </nav>
          </header>
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
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}