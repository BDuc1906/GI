import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { MaterialCalculatorClient } from "./MaterialCalculatorClient";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

interface MaterialCalculatorPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "tools/material-calculator");
}

/**
 * BỔ SUNG (2026-09-22): trang UI cho `/api/tools/material-calculator`.
 * LƯU Ý LỊCH SỬ: bản đầu của trang này gọi backend dùng bảng vật liệu
 * hardcode GIẢ ("Jewel Sliver", "Boss Material"...) — đã phát hiện và sửa:
 * backend giờ tính từ dữ liệu thật trong DB (`Character.ascensionMaterials`
 * /`talentMaterials`, `Domain.materials`), xem `real-material-plan.ts`.
 *
 * Chỉ fetch field cần cho picker (không fetch toàn bộ record nặng) —
 * danh sách nhân vật nhỏ (~122), truyền thẳng làm props cho client
 * component, không cần thêm API riêng cho việc chọn nhân vật.
 */
export default async function MaterialCalculatorPage({ params }: MaterialCalculatorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const characters = await prisma.character.findMany({
    orderBy: [{ rarity: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      vision: true,
      rarity: true,
      iconUrl: true,
      elementIcon: true,
    },
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          Máy tính nguyên liệu
        </h1>
        <p className="text-text-secondary mb-8">
          Chọn nhân vật và khoảng cấp độ để tính tổng nguyên liệu đột phá
          (và tuỳ chọn cả kỹ năng) cần farm.
        </p>

        <MaterialCalculatorClient characters={characters} />
      </div>
    </div>
  );
}
