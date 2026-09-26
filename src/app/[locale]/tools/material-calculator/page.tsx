import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { MaterialCalculatorClient } from "./MaterialCalculatorClient";

interface MaterialCalculatorPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

/**
 * BỔ SUNG (2026-09-22): `/api/tools/material-calculator` có backend đầy
 * đủ (`MaterialCalculator` — 15 KB logic tính nguyên liệu nâng cấp thật)
 * nhưng trước đây KHÔNG CÓ trang UI nào gọi tới — tile "Máy tính nguyên
 * liệu" trên trang chủ trỏ nhầm sang `/characters` (đã sửa thành "Sắp ra
 * mắt" ở lượt trước). Đây là trang UI THẬT đầu tiên cho công cụ này.
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
