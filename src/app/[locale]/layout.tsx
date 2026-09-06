
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
import { CommandPalette } from "@/components/search/CommandPalette";
import { GlossaryProvider } from "@/components/glossary/GlossaryProvider";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { spectral, beVietnamPro } from "@/lib/ui/fonts";

// Cùng biến/fallback với sitemap.ts và robots.ts — một nguồn duy nhất cho
// domain thật, tránh lệch nhau giữa các file.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: "LEIBO",
      // BCP-47 → định dạng "xx_YY" mà Open Graph yêu cầu (vd "en_US",
      // "vi_VN"). Với các locale không có sẵn biến thể vùng miền rõ ràng
      // trong tên game (ja, ko, id, th, de, fr, it, pt, es, ru, tr), dùng
      // đúng mã quốc gia phổ biến nhất gắn với ngôn ngữ đó.
      locale: OG_LOCALE_MAP[locale] ?? "en_US",
      type: "website",
    },
    twitter: {
      // "summary_large_image" đúng chuẩn khi đã có ảnh 1200x630 thật (xem
      // app/opengraph-image.tsx, app/characters/[id]/opengraph-image.tsx).
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      // hreflang cho mọi locale + "x-default" trỏ về bản tiếng Anh — báo
      // cho Google biết đây là các bản dịch của CÙNG một trang, tránh bị
      // tính là nội dung trùng lặp (duplicate content) giữa các locale.
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
  };
}

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  vi: "vi_VN",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  ja: "ja_JP",
  ko: "ko_KR",
  id: "id_ID",
  th: "th_TH",
  de: "de_DE",
  fr: "fr_FR",
  it: "it_IT",
  pt: "pt_PT",
  es: "es_ES",
  ru: "ru_RU",
  tr: "tr_TR",
};

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
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${spectral.variable} ${beVietnamPro.variable} font-body`} suppressHydrationWarning>
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
