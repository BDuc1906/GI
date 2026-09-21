import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { ElementIcon } from "@/components/character/ElementIcon";
import { ReactionTabs } from "@/components/character/ReactionTabs";
import { ELEMENT_ICON_URLS, reactionsInvolving } from "@/lib/game/element-reactions-data";

interface _ElementPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Cấu trúc `raw` thật sự có trong DB (nguồn: genshin-db, xem
 * data/inspect/elements.json). Trang này chỉ dùng `color` (mã hex CHÍNH
 * THỨC của nguyên tố), `region` (quốc gia gắn với nguyên tố) và icon.
 */
interface ElementRawData {
  color?: string;
  region?: string;
  images?: {
    base64?: string;
    wikia?: string;
  };
  [key: string]: unknown;
}

export const dynamic = "force-dynamic";

export default async function ElementsPage({ params }: _ElementPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const elements = await prisma.elementInfo.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Elements
        </h1>
        <p className="text-text-secondary mb-10 max-w-2xl leading-relaxed">
          The 7 elements of Teyvat. Every reaction, its damage formula, and
          the exact source (Genshin Impact Wiki + KeQingMains Theorycrafting
          Library) live in the section below, organized by category so you
          can filter instead of scrolling one giant list.
        </p>

        {/* ---- KHU 1: Nhận diện 7 nguyên tố ----
            CỐ Ý gọn — chỉ icon/tên/vùng + số phản ứng liên quan, KHÔNG
            nhét mô tả/công thức vào đây. Lý do: số phản ứng lệch quá lớn
            giữa các nguyên tố (Anemo/Geo = 2, Hydro/Electro = 11) — nếu in
            hết nội dung ngay tại đây thì 7 thẻ sẽ dài ngắn chênh lệch
            nghiêm trọng, không cách nào "thẳng hàng" được. Tách nội dung
            chi tiết sang khu 2 để khu này giữ được 7 thẻ đều nhau tuyệt
            đối trên mọi kích thước màn hình. */}
        {/* Bảng 1 hàng ngang duy nhất — 7 nguyên tố là 7 cột của cùng 1
            bảng, không wrap xuống hàng 2 như grid trước đây. `min-w` đủ
            rộng cho 7 cột thoải mái; nếu màn hình hẹp hơn thì cuộn ngang
            (overflow-x-auto) thay vì tự động xuống hàng — đúng yêu cầu
            "xếp theo hàng ngang dạng bảng". */}
        <div className="overflow-x-auto rounded-2xl border border-border shadow-sm shadow-black/5">
          <table className="w-full min-w-[880px] table-fixed border-collapse text-center">
            <tbody>
              <tr>
                {elements.map((element) => {
                  const raw = element.raw as ElementRawData | null;
                  const elColor = raw?.color || "var(--rarity-5)";
                  const icon = raw?.images?.base64;
                  const reactionCount = reactionsInvolving(element.name).length;
                  // Các nguyên tố khác mà nguyên tố này từng phản ứng cùng
                  // — hiện nhanh "phản ứng với ai" mà không lặp lại nội
                  // dung chi tiết của khu 2 bên dưới.
                  const partners = Array.from(
                    new Set(
                      reactionsInvolving(element.name)
                        .flatMap((r) => r.elements)
                        .filter((e) => e !== element.name)
                    )
                  );

                  return (
                    <td
                      key={element.name}
                      className="entity-elemental group relative border-r border-border/60 bg-bg-card p-5 align-top last:border-r-0"
                      style={{ "--el": elColor } as React.CSSProperties}
                    >
                      <div
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-[3px]"
                        style={{ background: elColor }}
                      />
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.15] blur-3xl transition-opacity duration-300 group-hover:opacity-25"
                        style={{ background: elColor }}
                      />

                      <div className="relative flex flex-col items-center">
                        {/* Icon THẬT của nguyên tố — data URI nhúng sẵn,
                            không request mạng, không bao giờ vỡ ảnh. */}
                        <span
                          className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: `color-mix(in srgb, ${elColor} 16%, transparent)`,
                            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${elColor} 40%, transparent)`,
                          }}
                        >
                          {icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={icon}
                              alt={`${element.name} element icon`}
                              width={30}
                              height={30}
                              className="h-[30px] w-[30px] object-contain"
                            />
                          ) : (
                            <span aria-hidden className="text-xs font-bold" style={{ color: elColor }}>
                              {element.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </span>

                        <h2 className="font-display text-lg font-bold leading-tight text-text-primary">
                          {element.name}
                        </h2>
                        {raw?.region && <span className="text-xs text-text-muted">{raw.region}</span>}

                        {partners.length > 0 && (
                          <div className="mt-3 flex items-center justify-center gap-1">
                            {partners.map((p) => (
                              <ElementIcon key={p} vision={p} iconUrl={ELEMENT_ICON_URLS[p]} size={15} glow={false} />
                            ))}
                          </div>
                        )}

                        <span className="mt-2 text-[11px] text-text-muted">
                          {reactionCount} {reactionCount === 1 ? "reaction" : "reactions"}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ---- KHU 2: Toàn bộ phản ứng + công thức tính sát thương ----
            Đây là nơi DUY NHẤT chứa mô tả đầy đủ + công thức của từng
            phản ứng — có tab theo loại (thường/Nguyệt/Tinh Vực/Cộng
            hưởng/Công thức) VÀ bộ lọc theo nguyên tố ngay trong tab, để
            người xem tự thu hẹp danh sách thay vì cuộn qua 1 khối văn bản
            khổng lồ. */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-text-primary mb-1">
            Elemental Reactions & Damage Formulas
          </h2>
          <p className="mb-6 max-w-2xl text-sm leading-relaxed text-text-secondary">
            Filter by category, then narrow further by element. Every
            formula links back to its source (Genshin Impact Wiki or
            KeQingMains) so you can verify the numbers yourself.
          </p>
          <ReactionTabs />
        </section>
      </div>
    </div>
  );
}
