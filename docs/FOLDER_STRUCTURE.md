# Cấu trúc thư mục LEIBO

Tài liệu này mô tả cấu trúc hiện tại của repository. Đây là hướng dẫn điều
hướng mã nguồn, không phải danh sách đầy đủ từng file; khi thêm module mới,
cập nhật mục tương ứng trong cùng thay đổi.

## Thư mục gốc

- `src/` – ứng dụng Next.js, API, thành phần giao diện và thư viện dùng chung.
- `scripts/` – crawl, seed, đồng bộ, kiểm tra và bảo trì dữ liệu.
- `prisma/` – schema Prisma và migration PostgreSQL.
- `data/` – dữ liệu hỗ trợ pipeline và tài liệu dự án.
- `docs/` – kiến trúc, quy trình và tài liệu vận hành.
- `tests/` – kiểm thử tự động.
- `public/` – tài nguyên tĩnh được phục vụ trực tiếp bởi ứng dụng.
- `messages/` – thông điệp giao diện theo locale.
- `node_modules/`, `.next/`, `.vercel/` – thư mục công cụ/build; không sửa
  trực tiếp và không coi là mã nguồn.

## `src/`

- `src/app/[locale]/` – trang App Router có tiền tố locale. Tên thư mục route
  là URL công khai; trang cần truy vấn đúng model và đặt metadata phù hợp.
- `src/app/api/` – API routes, tổ chức theo tài nguyên/chức năng.
- `src/components/` – thành phần React dùng lại.
- `src/i18n/` – cấu hình định tuyến và locale.
- `src/lib/api/` – truy vấn, phản hồi, kiểm tra lỗi và tiện ích API.
- `src/lib/db/` – Prisma Client và hỗ trợ truy cập database.
- `src/lib/data-sources/` – kiểu dữ liệu và tích hợp nguồn dữ liệu.
- `src/lib/i18n/` – tiện ích bản địa hoá.
- `src/lib/infra/` – logging, môi trường, thông báo và hạ tầng ứng dụng.
- `src/lib/sync/` – tiện ích đồng bộ.
- `src/lib/game/`, `src/lib/ui/` – logic game và tiện ích giao diện.

## `scripts/`

- `scripts/pipeline/` – crawl nguồn thành dữ liệu trung gian.
- `scripts/seed/` – nạp dữ liệu vào PostgreSQL qua Prisma.
- `scripts/sync/` – cập nhật/đồng bộ dữ liệu và cấu hình.
- `scripts/fix/` – các tác vụ sửa dữ liệu có phạm vi cụ thể.
- `scripts/images/` – tải, mirror hoặc kiểm tra ảnh.
- `scripts/validate/`, `scripts/check/` – xác thực và kiểm tra.
- `scripts/backup/`, `scripts/maintenance/` – sao lưu và bảo trì.
- `scripts/lib/` – helper dùng chung cho script.
- `scripts/data/` – mapping và cấu hình đầu vào được quản lý bằng phiên bản.

## `data/`

- `data/raw/` – snapshot JSON do lệnh crawl tạo để seed/review. Dữ liệu này
  được gitignore; không xem snapshot cục bộ là nguồn chuẩn hoặc là bản sao
  lưu được bảo đảm.
- `data/docs/` – tài liệu/snapshot đầu vào thuộc quy trình nội bộ.
- `data/local-genshin-assets/` – tài nguyên game cục bộ nếu có; tuân thủ
  giấy phép và không đưa tài sản không được phép phân phối lên site.

## Quy ước đặt tên và tính toàn vẹn

1. Tên route phải mô tả đúng nội dung mà page truy vấn và hiển thị. Khi tạo
   route danh mục, kiểm tra model Prisma, tiêu đề, liên kết điều hướng,
   metadata và sitemap cùng lúc.
2. Dùng tên folder/route tiếng Anh dạng kebab-case; tên hiển thị và nội dung
   dịch đặt trong UI/i18n, không dùng tên bản dịch làm định danh database.
3. Dùng ID ổn định từ nguồn hoặc slug ổn định; không tạo slug từ tên đã dịch.
   Không thay đổi ID đã được dùng trong URL nếu chưa có redirect/migration.
4. Tạo migration cho thay đổi schema; không sửa database trực tiếp để thay
   thế migration có thể tái lập.
5. Trước khi thêm file, tìm file có cùng trách nhiệm. Không tạo trang trùng
   nội dung chỉ vì đã có model mới; nếu có route, route đó phải truy vấn đúng
   model và được liên kết từ navigation/sitemap theo chủ đích.
6. `README.md` hướng dẫn bắt đầu; tài liệu chi tiết thuộc `docs/`. Cập nhật
   tài liệu liên quan trong cùng thay đổi với thay đổi hành vi.

## Những điểm cần giữ đúng khi cập nhật

- `/namecards` phải truy vấn `Namecard`, không phải `Outfit`.
- `/outfits` và `/windgliders` là hai loại nội dung riêng.
- Danh sách `/materials` không được giới hạn kết quả tuỳ tiện nếu tiêu đề
  tuyên bố là danh sách đầy đủ.
- Sitemap nên chứa các trang danh mục công khai; chỉ thêm trang chi tiết khi
  có URL ổn định và trang thực sự tồn tại.
- `NEXT_PUBLIC_SITE_URL` phải được đặt thành domain production trong môi
  trường deploy; fallback localhost chỉ phù hợp phát triển cục bộ.
