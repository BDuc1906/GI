
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface Crumb {
  name: string;
  /** Đường dẫn tương đối, vd "/characters" — SITE_URL tự nối vào phía trước. */
  path: string;
}

/**
 * schema.org BreadcrumbList — giúp Google hiển thị đường dẫn breadcrumb
 * (vd "LEIBO > Nhân vật > Kazuha") ngay trong kết quả tìm kiếm thay vì URL
 * thô. Dùng ở mọi trang chi tiết (characters/weapons/artifacts/domains),
 * mỗi trang tự truyền đúng danh mục cha của mình.
 *
 * Component thuần server (không "use client") — chỉ render 1 thẻ
 * <script type="application/ld+json">, không có tương tác nào cần JS phía
 * trình duyệt.
 */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };

  return (
    // JSON.stringify(dữ liệu do chính route Server Component tạo ra, không phải input người dùng chưa qua xử lý)
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
