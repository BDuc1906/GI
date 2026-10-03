# Chính sách dữ liệu Genshin Impact

Tài liệu này quy định cách LEIBO thu thập, đối chiếu và mô tả dữ liệu game.
Nó không phải hướng dẫn build hoặc tuyên bố rằng mọi giá trị trong database
đã được xác nhận độc lập với game.

## Thứ bậc nguồn

1. **Game client và thông báo chính thức của HoYoverse**: ưu tiên để xác nhận
   tên, nội dung và thay đổi phiên bản.
2. **[HoYoWiki](https://wiki.hoyolab.com/pc/genshin/)**: hữu ích để đối chiếu
   tên và phạm vi danh mục. Trang tự mô tả là cơ sở dữ liệu do editor và người
   chơi HoYoLAB cùng xây dựng; không mặc nhiên là xác nhận chính thức cho mọi
   con số/thuộc tính.
3. **[`genshin-db`](https://github.com/theBowja/genshin-db)**: nguồn máy đọc
   được hiện dùng trong pipeline. README upstream ghi dữ liệu tổng hợp từ
   Fandom Wiki và repository GenshinData, đồng thời cảnh báo format có thể đổi
   giữa phiên bản. Khớp với package chỉ xác nhận tính nhất quán với package.
4. Wiki/cơ sở dữ liệu cộng đồng khác là đối chiếu bổ sung. Ghi lại URL, ngày
   truy cập, phiên bản game và chính xác trường được xác nhận trước khi sửa
   dữ liệu.

## Quy tắc dữ liệu

- Giữ ID nguồn ổn định; tách ID khỏi tên hiển thị, tên dịch và slug URL.
- Phân biệt dữ liệu thiếu với giá trị `0`, danh sách rỗng hoặc “không tồn tại”.
  Không thay dữ liệu đã có bằng placeholder chỉ vì một bản nguồn trả thiếu.
- Không tự suy ra tỷ lệ rơi, điểm yếu, độ khó, hành vi hay địa điểm xuất hiện
  từ tên/nhóm quái. Trường chưa có nguồn đáng tin cậy phải để trống hoặc đánh
  dấu rõ là ước lượng; không trình bày như dữ kiện trong game.
- Traveler có các bộ thiên phú/mệnh cung riêng theo nguyên tố. Một bộ Anemo
  mặc định không đại diện cho tất cả biến thể. Trong LEIBO, Aether/Lumine gốc
  dùng bộ Anemo mặc định; các dòng biến thể nguyên tố lưu riêng.
- Manekin/Manekina là companion sự kiện, không phải playable characters độc
  lập. Hai bản ghi được giữ trong DB theo yêu cầu vận hành, bị loại khỏi catalog
  nhân vật công khai và được ghi cảnh báo trong integrity check.
- Không xóa material không được tham chiếu chỉ dựa vào phép đếm. Cần phân loại
  nguồn, mục đích và quan hệ sử dụng trước khi dọn dữ liệu.

## Quy trình cập nhật có thể lặp lại

1. Chốt phiên bản package và ngày crawl; giữ lockfile.
2. Crawl vào snapshot có thể review.
3. So sánh theo ID ổn định, báo riêng bản ghi thêm/xóa/thay đổi và field đổi.
4. Kiểm tra schema/migration và các phép chuyển đổi seed trước khi ghi DB.
5. Chạy `npm run db:seed`, sau đó `npm run db:verify`, typecheck và test.
6. Đối chiếu mẫu với nguồn độc lập; không dùng cùng một nguồn làm bằng chứng
   cho chính nó.
7. Cập nhật `docs/DATA_AUDIT_2026-10.md` khi phiên bản nguồn hoặc kết quả kiểm
   chứng thay đổi.

## Kết quả kiểm tra 2026-10-03

Chi tiết phương pháp, record counts, package deltas, route/SEO và giới hạn
được ghi trong [báo cáo kiểm toán dữ liệu](./DATA_AUDIT_2026-10.md). Tóm tắt:

- Pipeline/package đã cập nhật lên `genshin-db@5.2.14`, với dữ liệu upstream
  được mô tả là cập nhật tới game 7.1.
- Mười lăm nhóm dữ liệu bổ sung khớp raw JSON theo ID giữa snapshot crawl và
  database sau seed; 122 raw character record cũng khớp.
- Seed cập nhật 6 vũ khí, 2 nhân vật chơi được mới, artifact bonus và các
  danh mục có thay đổi. Chi phí Exaiphanes Blade là ngoại lệ: package mới chỉ
  trả Mora = 0, vì vậy giá trị cũ được giữ và chưa được xác minh độc lập.
- `npm run db:verify` đạt; hai bản ghi companion được giữ lại phát cảnh báo.
- HoYoWiki đối chiếu được một số danh mục, nhưng không xác minh toàn bộ field
  và không tạo cơ sở để khẳng định “chính xác tuyệt đối”.

**Kết luận:** dữ liệu được kiểm chứng là khớp nguồn đã ghi rõ và các phép kiểm
tra cấu trúc đã chạy; không có phương pháp nào trong lần audit này chứng minh
toàn bộ nội dung khớp tuyệt đối với mọi phiên bản game.
