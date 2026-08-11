# Bổ sung cho docs/SECURITY.md — Mô hình bảo mật của AI Agent

(Dán nội dung dưới đây vào `docs/SECURITY.md`, hiện đang trống)

## AI Agent (`src/agent/`)

- **Không có hệ thống user login.** Toàn bộ truy cập public (search,
  compare, explain) là ẩn danh — giống mọi API khác của site.
- **Quyền admin** (sửa dữ liệu qua `fixData`, đồng bộ qua `syncData`,
  và 2 route `/api/admin/fix`, `/api/admin/sync`) được cấp DUY NHẤT
  qua header `Authorization: Bearer <ADMIN_API_KEY>` — secret 1 người
  giữ, so sánh bằng `timingSafeEqual` (xem `src/agent/utils/auth.ts`).
  Chưa cấu hình `ADMIN_API_KEY` → fail closed, không ai là admin.
- **LLM không bao giờ tự gọi được tool admin.** `ToolRegistry.getAITools()`
  luôn loại tool có `permission: "admin"` khỏi tập tool đưa cho LLM,
  bất kể intent được phân loại là gì hay user gọi có thật sự là admin
  hay không — hành động ghi đè DB luôn phải đi qua endpoint admin
  tường minh, có xác nhận rõ ràng, không lẫn vào một đoạn hội thoại tự
  nhiên.
- **Mọi thay đổi dữ liệu đều có audit log** (bảng `AuditLog`) — ghi lại
  giá trị cũ/mới, ai thực hiện, lý do, thành công hay lỗi. Xem
  `src/lib/agent/AuditLogger.ts`.
- **Rate limit riêng cho `/api/agent`**, tách khỏi rate limit chung của
  API đọc dữ liệu — mỗi request ở đây tốn 1+ lần gọi LLM thật (chi phí
  thật), không giống 1 query Prisma thông thường.
- **Rủi ro còn tồn đọng cần biết:**
  - `AmbrProvider` (nguồn dữ liệu "live") CHƯA được kiểm thử với
    endpoint thật — mapping field có thể sai. Trước khi bật
    `AutoFixEngine`/`FixTool` dựa vào nguồn này trên production, PHẢI
    verify thủ công (xem cảnh báo trong chính file đó).
  - `syncData`/`/api/admin/sync` KHÔNG ghi trực tiếp vào DB — chỉ
    trigger workflow `update-data.yml` (crawl → DB test → verify →
    Pull Request để review), đúng quy trình an toàn dự án đã thiết kế
    sẵn cho việc cập nhật dữ liệu lớn từ genshin-db.
  - `GITHUB_TOKEN` dùng để trigger workflow có quyền ghi Actions trên
    repo — lưu như secret, giới hạn scope đúng 1 repo, không dùng
    chung với token cá nhân quyền rộng hơn.
