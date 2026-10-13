import { setRequestLocale } from "next-intl/server";
import { WishHistoryClient } from "@/features/wish";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "tools/wish-history");
}

export default async function WishHistoryPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          Lịch Sử Cầu Nguyện &amp; Pity Tracker
        </h1>
        <p className="text-text-secondary mb-8">
          Theo dõi số lần quay gacha, đếm số roll còn lại tới bảo hiểm (pity), phát hiện soft pity và quản lý danh sách 5★ trúng tuyển.
        </p>

        <WishHistoryClient />
      </div>
    </div>
  );
}
