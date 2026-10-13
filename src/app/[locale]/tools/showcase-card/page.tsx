import { setRequestLocale } from "next-intl/server";
import { ShowcaseCardGeneratorClient } from "@/features/showcase";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "tools/showcase-card");
}

export default async function ShowcaseCardPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          Showcase Card Generator
        </h1>
        <p className="text-text-secondary mb-8">
          Tạo thẻ nhân vật đẹp mắt chuẩn tỉ lệ 1200x630 để chia sẻ lên mạng xã hội, Discord, hoặc lưu trữ kỷ niệm.
        </p>

        <ShowcaseCardGeneratorClient />
      </div>
    </div>
  );
}
