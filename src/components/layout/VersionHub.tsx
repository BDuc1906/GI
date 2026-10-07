import { Link } from "@/i18n/navigation";
import { getVersionIndex, summarize } from "@/core/game/versions";

/**
 * Khối "Phiên bản mới nhất" trên trang chủ — dữ liệu THẬT từ cột gameVersion.
 *
 * Trước đây khối này hiển thị dữ liệu giả cứng (đếm ngược "5 ngày 12 giờ",
 * giftcode mẫu). Dữ liệu banner/giftcode chưa có nguồn trong dự án nên đã bỏ
 * thay vì hiện thông tin sai. Khi có nguồn banner thật, thêm lại thành khối riêng.
 */
export async function VersionHub() {
  let latest: string | undefined;
  let chips: Array<{ label: string; n: number }> = [];
  let total = 0;

  try {
    const index = await getVersionIndex();
    latest = index.versions.at(-1);
    if (latest) {
      const s = summarize(index, latest);
      total = s.added;
      chips = index.sources
        .map((src) => ({ label: src.label, n: s.bySource[src.key]?.added ?? 0 }))
        .filter((c) => c.n > 0);
    }
  } catch {
    return null; // không để lỗi DB làm hỏng cả trang chủ
  }

  if (!latest) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          Phiên bản mới nhất trong dữ liệu
        </h2>
        <p className="text-text-secondary">
          Xem mỗi phiên bản thêm gì, từ lúc ra mắt đến hiện tại
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-bg-card border-2 border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h3 className="font-display text-3xl font-bold text-text-primary">Phiên bản {latest}</h3>
          <span className="px-3 py-1 bg-bg-elevated text-accent-bright text-xs font-semibold rounded-full whitespace-nowrap">
            {total} mục mới
          </span>
        </div>
        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-2 mb-5">
            {chips.map((c) => (
              <li
                key={c.label}
                className="text-sm px-3 py-1 rounded-full border border-border text-text-secondary"
              >
                +{c.n} {c.label.toLowerCase()}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-3">
          <Link href={`/versions/${latest}`} className="btn-primary px-4 py-2 rounded-lg text-sm">
            Xem phiên bản {latest}
          </Link>
          <Link
            href="/versions"
            className="px-4 py-2 rounded-lg text-sm border border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
          >
            Tất cả phiên bản
          </Link>
        </div>
      </div>
    </section>
  );
}
