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
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Cập Nhật Phiên Bản Genshin Impact
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Theo dõi chi tiết thay đổi và nhân vật/vũ khí mới theo từng bản cập nhật
          </p>
        </div>
        <Link
          href="/versions"
          className="text-sm font-semibold text-accent-bright hover:underline shrink-0"
        >
          Lịch sử phiên bản &rarr;
        </Link>
      </div>

      <div className="bg-bg-card/80 border border-border/80 hover:border-accent-500/50 rounded-2xl p-6 transition-all shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <div>
            <span className="text-xs font-mono uppercase text-accent-bright tracking-wider">Bản phát hành hiện tại</span>
            <h3 className="font-display text-3xl font-extrabold text-text-primary mt-0.5">Phiên bản {latest}</h3>
          </div>
          <span className="px-3.5 py-1.5 bg-accent-500/15 text-accent-bright border border-accent-500/30 text-xs font-semibold rounded-full self-start sm:self-center">
            +{total} nội dung &amp; dữ liệu mới
          </span>
        </div>
        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-2 mb-6">
            {chips.map((c) => (
              <li
                key={c.label}
                className="text-xs px-3 py-1.5 rounded-lg bg-bg-elevated/70 border border-border/70 text-text-secondary"
              >
                +{c.n} {c.label.toLowerCase()}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap gap-3">
          <Link href={`/versions/${latest}`} className="btn-anemo px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm">
            Xem chi tiết bản {latest}
          </Link>
          <Link
            href="/versions"
            className="btn-secondary px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Tất cả phiên bản từ 1.0
          </Link>
        </div>
      </div>
    </section>
  );
}
