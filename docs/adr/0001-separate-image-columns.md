# ADR 0001: Tách URL ảnh nguồn và URL ảnh hiển thị

- **Trạng thái:** Đã áp dụng
- **Phạm vi:** Ảnh của các thực thể game được seed và mirror

## Bối cảnh

Seed cập nhật URL ảnh gốc từ nguồn game. Quy trình mirror lưu URL được phục
vụ trên site; nếu hai vai trò dùng chung một cột, lần seed tiếp theo có thể
ghi đè URL đã mirror hoặc làm mất URL nguồn để đối chiếu.

## Quyết định

- `iconUrlOriginal` giữ URL gốc do seed cập nhật.
- `iconUrl` giữ URL dùng để hiển thị sau khi mirror.
- Seed không ghi đè `iconUrl` của bản ghi đã có; mirror chịu trách nhiệm cập
  nhật URL đó.

## Hệ quả

- Có thể kiểm tra nguồn ban đầu và URL phục vụ độc lập.
- Quy trình seed và mirror phải chạy theo đúng thứ tự; thiếu một bước có thể
  khiến ảnh mới chưa được phục vụ từ kho ảnh của dự án.
