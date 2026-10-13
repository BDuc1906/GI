import { setRequestLocale } from "next-intl/server";
import { EnkaImporterClient } from "@/features/enka";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "tools/enka-sync");
}

export default async function EnkaSyncPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          Đồng bộ Enka.Network qua UID
        </h1>
        <p className="text-text-secondary mb-8">
          Nhập 9 chữ số UID trong game để tự động kéo thông tin showcase nhân vật, cấp độ, thánh di vật và chỉ số chiến đấu thực tế.
        </p>

        <EnkaImporterClient />
      </div>
    </div>
  );
}
