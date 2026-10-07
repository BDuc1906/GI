import type { ReactNode } from "react";
import { paragraphs } from "@/core/game/enemy-format";
import { excerpt } from "@/core/game/text-format";

interface LoreCardProps {
  name: string;
  /** Dòng phụ dưới tên, vd tên khu vực. */
  subtitle?: string | null;
  badges?: Array<{ label: string; title?: string }>;
  description?: string | null;
  /** Ảnh nhỏ bên trái tiêu đề (vd EntityThumb size="md"). */
  thumb?: ReactNode;
  /** Ảnh ngang phía trên thẻ (vd EntityThumb size="banner"). */
  banner?: ReactNode;
}

/**
 * Thẻ mục từ có mô tả lore (Địa lý, Động vật...). Hiện đoạn trích; nếu mô tả dài hơn
 * thì cho mở rộng bằng <details> (không cần JavaScript).
 */
export function LoreCard({ name, subtitle, badges, description, thumb, banner }: LoreCardProps) {
  const paras = paragraphs(description);
  const full = paras.join(" ");
  const short = excerpt(full);
  const hasMore = paras.length > 1 || short !== full;

  return (
    <article className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-accent-500 transition-all h-full">
      {banner && <div className="mb-3">{banner}</div>}

      <div className="flex items-start gap-3">
        {thumb}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary">{name}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 text-[11px]">
              {badges.map((b) => (
                <span
                  key={b.label}
                  title={b.title}
                  className="px-2 py-0.5 rounded-full border border-border text-text-secondary"
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {paras.length === 0 ? (
        <p className="text-sm text-text-muted mt-3">Chưa có mô tả.</p>
      ) : hasMore ? (
        <details className="mt-3 text-sm text-text-secondary">
          <summary className="cursor-pointer list-none">
            <span className="block">{short}</span>
            <span className="inline-block mt-1 text-xs text-accent-bright underline">Đọc toàn bộ</span>
          </summary>
          <div className="mt-2 space-y-2">
            {paras.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </details>
      ) : (
        <p className="mt-3 text-sm text-text-secondary">{full}</p>
      )}
    </article>
  );
}
