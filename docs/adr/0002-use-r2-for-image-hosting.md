# ADR 0002: Dùng Cloudflare R2 cho ảnh đã mirror

- **Trạng thái:** Đã áp dụng
- **Phạm vi:** URL ảnh do quy trình `scripts/mirror-images-to-r2.ts` quản lý

## Bối cảnh

Ảnh game được lấy từ nguồn bên ngoài và có thể được mirror vào kho ảnh của
dự án. Ứng dụng cần phân biệt URL nguồn với URL thực sự được dùng khi render.

## Quyết định

Quy trình mirror lưu URL R2 đã tạo vào `iconUrl`; URL nguồn được giữ riêng
trong `iconUrlOriginal`. Seed chỉ cập nhật URL nguồn, không thay URL đã mirror
của bản ghi hiện hữu.

## Hệ quả

- R2 là kho phục vụ ảnh đã mirror; URL hotlink nguồn chỉ là đầu vào/fallback.
- Cần cấu hình thông tin truy cập R2 trong môi trường vận hành, không lưu
  credential trong repository.
- Ảnh không mirror thành công phải được báo rõ, không coi URL nguồn lỗi là
  một ảnh R2 hợp lệ.
