# Cấu trúc thư mục LEIBO

Tài liệu này phản ánh cấu trúc repository tại ngày 2026-10-03. Đây là bản đồ
module chính, không phải danh sách từng file; khi thay đổi cấu trúc, cập nhật
tài liệu trong cùng pull request.

## Thư mục gốc

- `.github/workflows/` – các workflow CI, preview, đồng bộ và kiểm tra dữ liệu.
- `src/` – ứng dụng Next.js, feature modules, API và thư viện dùng chung.
- `scripts/` – crawl, seed, sửa dữ liệu, đồng bộ và bảo trì.
- `prisma/` – schema PostgreSQL và migration có thể tái lập.
- `data/raw/` – snapshot JSON do crawl tạo; gitignored và có thể tái tạo.
- `data/docs/` – tài liệu đầu vào của dự án.
- `data/local-genshin-assets/` – tài nguyên game cục bộ, nếu được cấp phép.
- `docs/` – hướng dẫn kiến trúc, quy trình, ADR và báo cáo kiểm toán dữ liệu.
- `public/` – tài nguyên tĩnh được phục vụ trực tiếp.
- `tests/` – unit/integration tests.
- `.next/`, `.vercel/`, `node_modules/` – thư mục build/công cụ; không sửa
  trực tiếp hay dùng làm nguồn sự thật cho mã nguồn.

## Ứng dụng (`src/`)

- `src/app/[locale]/` – trang App Router có tiền tố locale; đường dẫn thư mục
  là URL công khai.
- `src/app/api/` – API Route Handlers, tổ chức theo tài nguyên/chức năng.
- `src/components/` – thành phần giao diện dùng chung.
- `src/features/` – feature modules; ví dụ `characters/` chứa query,
  repository, service và logic listing.
- `src/core/`, `src/server/`, `src/hooks/` – logic lõi, xử lý phía server và
  React hooks.
- `src/lib/` – tiện ích dùng chung: `api/`, `db/`, `data-sources/`, `game/`,
  `i18n/`, `infra/`, `sync/` và `ui/`.
- `src/i18n/` – routing và cấu hình locale.
- `src/messages/` – thông điệp giao diện theo locale.

## Pipeline dữ liệu (`scripts/`)

- `scripts/pipeline/` – crawl nguồn thành snapshot trong `data/raw/`.
- `scripts/seed/` – chuẩn hoá và upsert dữ liệu qua Prisma.
- `scripts/sync/` – đồng bộ phiên bản nguồn và pipeline cập nhật.
- `scripts/fix/` – tác vụ sửa dữ liệu có phạm vi cụ thể, có thể chạy độc lập.
- `scripts/lib/` – helper dùng chung cho seed/crawl.
- `scripts/data/` – mapping và cấu hình đầu vào được quản lý bằng Git.
- `scripts/backup/`, `scripts/images/`, `scripts/maintenance/`,
  `scripts/validate/` – backup, mirror ảnh, bảo trì và kiểm tra.

## Quy ước route, file và ID

1. Tên route dùng tiếng Anh dạng kebab-case; tiêu đề/nội dung dịch nằm trong
   UI và message catalogs, không dùng bản dịch làm ID.
2. Tên route, model được truy vấn, tiêu đề trang, sitemap và API phải cùng nói
   về một loại nội dung. `/namecards` truy vấn `Namecard`; `/outfits` truy vấn
   `Outfit`; `/windgliders` truy vấn `Windglider`.
3. Dùng ID nguồn hoặc slug ổn định. Không tạo khóa từ tên bản dịch; đổi ID URL
   phải có migration và redirect thích hợp.
4. Không tạo file route mới trước khi tìm prior art theo trách nhiệm và URL.
   Trang mới cần được nối vào navigation/sitemap theo chủ đích.
5. Thay đổi schema PostgreSQL phải có migration trong `prisma/migrations/`;
   không thay migration bằng thao tác database thủ công.
6. Snapshot trong `data/raw/` chỉ là đầu vào tái tạo được, không phải bản
   backup hay nguồn thẩm quyền.
7. `README.md` là hướng dẫn bắt đầu; quy ước kỹ thuật và kết quả kiểm tra
   chuyên sâu đặt trong `docs/`. Tài liệu liên quan phải được cập nhật cùng
   thay đổi code.

## SEO và kiểm tra route

- `src/app/sitemap.ts` liệt kê các trang danh mục công khai theo locale và
  trang chi tiết có ID ổn định.
- `src/app/robots.ts`, layout metadata và sitemap cùng lấy domain từ
  `NEXT_PUBLIC_SITE_URL`; fallback `http://localhost:3000` chỉ dành cho local.
- Không thêm trang quản trị/API vào sitemap.
- Chỉ đưa nội dung chơi được vào catalog nhân vật; bản ghi companion sự kiện
  giữ lại trong DB không được tính như playable character.
- Khi đổi route, kiểm tra metadata, sitemap, navigation, API và model truy vấn
  trong cùng thay đổi.

## Nguồn liên quan

- Schema: `prisma/schema.prisma`
- Crawl: `scripts/pipeline/`
- Seed và kiểm tra integrity: `scripts/seed/`
- Báo cáo dữ liệu và sai khác nguồn: `docs/DATA_AUDIT_2026-10.md`
