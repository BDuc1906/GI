
import "../globals.css";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";
import { getTranslations, getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SiteNav } from "@/components/layout/SiteNav";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CommandPalette } from "@/features/search/components/CommandPalette";
import { GlossaryProvider } from "@/features/glossary/GlossaryProvider";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { inter } from "@/lib/ui/fonts";
import { getLocalizedUrl, getOpenGraphLocale, getSiteUrl } from "@/lib/seo/metadata";

const SITE_URL = getSiteUrl();

// Next.js prerender sẵn 15 route "/[locale]" lúc build (thay vì render
// theo yêu cầu lần đầu) — giữ nguyên hành vi static của layout gốc trước
// khi thêm i18n.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      // Các trang con set metadata.title riêng (vd "Kazuha — LEIBO") sẽ tự
      // được chèn vào %s — không cần lặp lại "LEIBO" thủ công ở mỗi trang.
      template: "%s",
    },
    description,
    applicationName: "LEIBO",
    creator: "LEIBO",
    publisher: "LEIBO",
    category: "games",
    referrer: "origin-when-cross-origin",
    formatDetection: { telephone: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      siteName: "LEIBO",
      images: [
        {
          url: getLocalizedUrl(locale, "opengraph-image"),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: getOpenGraphLocale(locale),
      type: "website",
    },
    twitter: {
      // "summary_large_image" đúng chuẩn khi đã có ảnh 1200x630 thật (xem
      // app/opengraph-image.tsx, app/characters/[id]/opengraph-image.tsx).
      card: "summary_large_image",
      title,
      description,
      images: [getLocalizedUrl(locale, "opengraph-image")],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Báo cho next-intl (Server Components phía dưới, vd generateMetadata
  // của từng trang con) locale nào đang render — bắt buộc khi dùng
  // generateStaticParams để tránh request locale bị lẫn giữa các build
  // static song song.
  setRequestLocale(locale);

  // Truyền tường minh locale + messages thay vì dựa vào cơ chế "tự động
  // kế thừa" của NextIntlClientProvider (dùng khi bỏ trống props) — cơ chế
  // đó không ổn định khi build production bằng Turbopack (next-intl v4 +
  // Turbopack production là tổ hợp còn mới), gây lỗi "context from
  // NextIntlClientProvider was not found" ngẫu nhiên ở MỌI trang, chỉ lộ
  // ra ở `next start`, không lộ ở `next dev`. Truyền tay là cách chính
  // thống, ổn định, next-intl docs khuyến nghị cho trường hợp cần chắc chắn.
  const messages = await getMessages();

  const t = await getTranslations({ locale, namespace: "Layout" });
  const tMeta = await getTranslations({ locale, namespace: "Metadata" });

  const WEBSITE_JSON_LD = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: tMeta("title"),
    url: getLocalizedUrl(locale),
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-body`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <GlossaryProvider>
              {/* CHẨN ĐOÁN 2026-08: bọc Suspense quanh SiteNav — đây là
                  client component ĐẦU TIÊN render trên MỌI trang, gọi
                  useTranslations("Nav") ngay dòng đầu hàm, không có
                  Suspense boundary nào phía trên ngoài chính
                  NextIntlClientProvider. Cùng pattern nghi vấn đã thử với
                  HomeHero (không hiệu quả vì HomeHero chỉ ở trang chủ,
                  còn lỗi xảy ra ở MỌI trang — SiteNav mới khớp đúng phạm
                  vi lỗi thật). */}
              <Suspense fallback={null}>
                <SiteNav />
              </Suspense>
              <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                {children}
              </main>
              <footer className="border-t border-border mt-8">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 text-center text-xs text-[color:var(--text-muted)]">
                  {t.rich("disclaimer", {
                    brandLink: (chunks) => (
                      <a
                        href="https://www.hoyoverse.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-[color:var(--gold-bright)] transition-colors"
                      >
                        {chunks}
                      </a>
                    ),
                  })}
                  <br />
                  <Link href="/privacy" className="underline hover:text-[color:var(--gold-bright)] transition-colors">
                    {t("privacy")}
                  </Link>
                  {" · "}
                  <Link href="/terms" className="underline hover:text-[color:var(--gold-bright)] transition-colors">
                    {t("terms")}
                  </Link>
                </div>
              </footer>
              <ChatWidget />
              <CommandPalette />
            </GlossaryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
