# Quy ước dữ liệu Genshin Impact trong LEIBO

> Tài liệu này xác định nguồn, phạm vi và mức độ tin cậy của dữ liệu game
> trong dự án. Đây không phải hướng dẫn build nhân vật hay bảng chiến thuật.
> Không coi nội dung chưa được kiểm chứng độc lập là dữ kiện chính thức.

## Nguồn dữ liệu và thứ tự sử dụng

1. **Game client / thông báo trong game của HoYoverse** là nguồn ưu tiên để
   xác nhận nội dung, tên hiển thị, thuộc tính và thay đổi phiên bản.
2. [HoYoWiki](https://wiki.hoyolab.com/pc/genshin/) được dùng để đối chiếu
   danh mục và tên. Đây là wiki do cộng đồng xây dựng trên nền tảng HoYoLAB;
   sự hiện diện trên HoYoWiki không tự động chứng minh mọi con số hay mô tả
   là chính thức.
3. [`genshin-db`](https://github.com/theBowja/genshin-db) là nguồn máy đọc
   được mà pipeline hiện dùng. README của dự án ghi rõ dữ liệu lấy từ
   Fandom Wiki và repository GenshinData, đồng thời cảnh báo định dạng có thể
   thay đổi giữa các phiên bản. Vì vậy đây là nguồn dữ liệu thuận tiện, không
   phải thẩm quyền độc lập.
4. Các wiki/cơ sở dữ liệu cộng đồng khác chỉ là nguồn kiểm tra bổ sung. Ghi
   rõ URL, ngày kiểm tra và trường đã đối chiếu nếu dùng để thay đổi DB.

## Quy tắc biểu diễn

- Giữ nguyên tên tiếng Anh/ID từ nguồn làm khóa dữ liệu; tên bản địa hoá là
  dữ liệu hiển thị riêng, không dùng để tạo khóa.
- Ghi riêng **tên hiển thị**, **mô tả**, **dữ liệu nâng cấp**, **phiên bản
  game** và **nguồn**. Không suy diễn giá trị bị thiếu từ tên, độ hiếm hoặc
  nhóm vật phẩm.
- Giá trị thiếu trong nguồn không đồng nghĩa giá trị bằng 0, danh sách rỗng,
  hay không tồn tại trong game. Không ghi đè dữ liệu tốt bằng placeholder.
- Traveler có hai nhân vật gốc và dữ liệu kỹ năng phụ thuộc nguyên tố. Nếu
  UI chỉ cung cấp một bộ kỹ năng mặc định, phải ghi rõ nguyên tố đó; không
  trình bày bộ mặc định như đủ mọi biến thể.
- Bản ghi NPC/đồng hành sự kiện hoặc biến thể Traveler không phải nhân vật
  chơi được độc lập không được tính vào số nhân vật chơi được nếu chưa có
  quy tắc sản phẩm giải thích rõ.
- Không gán phần trăm rơi đồ, điểm yếu, độ khó, hành vi hay khu vực xuất hiện
  bằng phỏng đoán. Các trường do heuristic tạo phải được gắn nhãn nội bộ là
  suy luận và không hiển thị như dữ kiện xác thực.

## Đối chiếu lần 2026-10-03

- Package được kiểm tra: `genshin-db@5.2.14`; package ban đầu trong dự án là
  `5.2.13`. Repository upstream ghi dữ liệu đến phiên bản game 7.1.
- Crawl mới nhất tạo được 122 nhân vật sau khi bỏ qua Manekin/Manekina theo
  quy tắc hiện có; hai nhân vật mới trong nguồn là Vodyanitsa và Vesna.
- Database trước lần seed có 20 model và 5.009 hàng. 15 nhóm raw đã khớp
  chính xác với package 5.2.13 theo ID và JSON trong lần đối chiếu trước.
  Kết quả đó xác nhận tính nhất quán với snapshot nguồn cũ, không xác nhận
  tuyệt đối với game.
- Với nguồn 5.2.14, các chênh lệch ghi nhận gồm: 6 weapon mới; 10 achievement
  mới và 1 thay đổi; 19 animal thay đổi; thêm dữ liệu constellation, enemy,
  food, namecard, outfit, talent, windglider; 2 material mới và 6 material
  thay đổi. Domains không thay đổi. Chi tiết theo từng tên được lưu trong
  báo cáo `docs/DATA_AUDIT_2026-10.md`.
- Aether/Lumine có 5 talent và 6 constellation trong crawl cho bộ Anemo mặc
  định. DB trước khi reseed không có các trường này; không thể coi một bộ
  nguyên tố là tất cả kỹ năng Traveler.
- HoYoWiki đã được đối chiếu theo danh mục ở các nhóm artifact, enemy,
  wildlife, weapon, namecard và tài nguyên. Tên artifact 63/63, enemy
  346/346 và wildlife 223/223 của DB cũ có mặt trong danh mục tương ứng.
  Các mục phụ trội và khác biệt cách gọi cần phân loại riêng, không tự động
  xem là lỗi.

## Hạn chế và cách cập nhật

- Một lần kiểm tra danh mục không xác minh nội dung từng trang, con số combat,
  xác suất rơi đồ, bản dịch, hay trạng thái mới nhất trong game.
- Một bản ghi khớp với `genshin-db` chỉ chứng minh DB khớp package tại thời
  điểm đó; không phải hai nguồn xác nhận độc lập nếu package lấy dữ liệu từ
  wiki cộng đồng.
- Trước khi seed phiên bản mới: cập nhật package, crawl snapshot, so sánh theo
  ID, xem xét mọi thay đổi và kiểm tra cấu trúc DB. Sau seed, chạy
  `npm run db:verify`, typecheck và các test liên quan.
- Chỉ đánh dấu một trường “đã xác nhận” khi có nguồn cụ thể, phiên bản/ngày
  truy cập và phép so sánh có thể lặp lại. Nếu không, dùng nhãn “theo nguồn
  genshin-db”, “chưa xác minh độc lập” hoặc “suy luận”.
