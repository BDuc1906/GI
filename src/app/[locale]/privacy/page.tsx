import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

// Nội dung dưới đây phản ánh ĐÚNG những gì codebase thật sự làm tại thời
// điểm viết trang này — không phải văn bản mẫu chung chung:
//  - Không có đăng nhập/tài khoản người dùng (không model User nào trong
//    prisma/schema.prisma).
//  - Không có analytics/tracking script nào được nhúng.
//  - next-themes (ThemeProvider.tsx) lưu lựa chọn giao diện sáng/tối vào
//    localStorage trình duyệt (key "theme") — dữ liệu này KHÔNG rời khỏi
//    máy người dùng, server không đọc được.
//  - middleware.ts áp rate-limit theo IP (xem src/lib/api/rate-limit.ts) —
//    IP chỉ giữ tạm trong bộ nhớ để đếm request, không ghi log lâu dài,
//    không gắn với bất kỳ định danh cá nhân nào khác.
// NẾU sau này thêm analytics/quảng cáo/tài khoản người dùng, trang này BẮT
// BUỘC phải cập nhật lại cho khớp — đừng để lệch giữa chính sách công bố và
// thực tế code, đó là chính rủi ro (và vi phạm GDPR/CCPA) mà trang này sinh
// ra để tránh.
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Privacy" });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 prose-invert">
      <h1 className="font-display text-3xl font-bold text-text-primary mb-6">{t("title")}</h1>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("noAccountTitle")}</h2>
          <p>{t("noAccountBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("themeChoiceTitle")}</h2>
          <p>
            {t.rich("themeChoiceBody", {
              code: (chunks) => <code className="text-gold-bright">{chunks}</code>,
            })}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("rateLimitTitle")}</h2>
          <p>{t("rateLimitBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("noAdsTitle")}</h2>
          <p>{t("noAdsBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("contactTitle")}</h2>
          <p>{t("contactBody")}</p>
        </section>
      </div>
    </div>
  );
}
