
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-6xl font-bold text-[color:var(--gold-bright)] mb-4">
        404
      </p>
      <h1 className="font-display text-2xl font-bold tracking-wide text-neutral-100 uppercase mb-3">
        Không Tìm Thấy
      </h1>
      <p className="text-sm text-[color:var(--parchment-dim)] max-w-md mb-8">
        Trang bạn tìm không tồn tại, hoặc nhân vật / vũ khí / thánh di vật này
        chưa có trong kho dữ liệu.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="rounded-lg border border-[color:var(--gold)]/40 bg-neutral-900/40 px-5 py-2 text-sm font-medium text-[color:var(--gold-bright)] hover:border-[color:var(--gold-bright)] transition-colors"
        >
          Về Trang Chủ
        </Link>
        <Link
          href="/characters"
          className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-5 py-2 text-sm font-medium text-neutral-300 hover:text-[color:var(--gold-bright)] hover:border-[color:var(--gold)]/40 transition-colors"
        >
          Xem Nhân Vật
        </Link>
      </div>
    </div>
  );
}
