# ADR 0003: Tách kết nối runtime và kết nối migration PostgreSQL

- **Trạng thái:** Đã áp dụng
- **Phạm vi:** Prisma/PostgreSQL

## Bối cảnh

Ứng dụng kết nối database liên tục ở runtime, trong khi Prisma Migrate cần
kết nối trực tiếp để quản lý schema. Cấu hình Neon cung cấp URL pooled và URL
direct cho hai trường hợp khác nhau.

## Quyết định

- `DATABASE_URL` được Prisma Client sử dụng cho kết nối runtime.
- `DIRECT_URL` được `prisma.config.ts` dùng cho migration khi được cấu hình.
- Cả hai URL chỉ được đặt trong biến môi trường; không commit giá trị thật.

## Hệ quả

- Môi trường production cần cấu hình đúng URL cho cả runtime và migration.
- Khi chạy migration, kiểm tra `DIRECT_URL` trỏ đúng database/môi trường trước
  khi áp dụng.
- Migration phải được lưu trong `prisma/migrations/` để có thể tái lập.
