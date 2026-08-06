
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư — LEIBO",
  description: "LEIBO thu thập và sử dụng dữ liệu gì khi bạn dùng trang web.",
};

// Nội dung dưới đây phản ánh ĐÚNG những gì codebase thật sự làm tại thời
// điểm viết trang này — không phải văn bản mẫu chung chung:
//  - Không có đăng nhập/tài khoản người dùng (không model User nào trong
//    prisma/schema.prisma).
//  - Không có analytics/tracking script nào được nhúng.
//  - next-themes (ThemeProvider.tsx) lưu lựa chọn giao diện sáng/tối vào
//    localStorage trình duyệt (key "theme") — dữ liệu này KHÔNG rời khỏi
//    máy người dùng, server không đọc được.
//  - middleware.ts áp rate-limit theo IP (xem src/lib/api/rate-limit.ts) —
//    IP chỉ giữ tạm trong bộ nhớ để đếm request, không ghi log lâu dài,
//    không gắn với bất kỳ định danh cá nhân nào khác.
// NẾU sau này thêm analytics/quảng cáo/tài khoản người dùng, trang này BẮT
// BUỘC phải cập nhật lại cho khớp — đừng để lệch giữa chính sách công bố và
// thực tế code, đó là chính rủi ro (và vi phạm GDPR/CCPA) mà trang này sinh
// ra để tránh.
export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 prose-invert">
      <h1 className="font-display text-3xl font-bold text-primary mb-6">
        Chính sách quyền riêng tư
      </h1>

      <div className="space-y-6 text-sm text-secondary leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Không có tài khoản, không thu thập thông tin cá nhân</h2>
          <p>
            LEIBO không yêu cầu đăng ký hay đăng nhập. Chúng tôi không thu thập
            tên, email, hay bất kỳ thông tin định danh cá nhân nào.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Lựa chọn giao diện (sáng/tối)</h2>
          <p>
            Khi bạn đổi giao diện sáng/tối, lựa chọn đó được lưu bằng{" "}
            <code className="text-gold-bright">localStorage</code> ngay trên
            trình duyệt của bạn — dữ liệu này không gửi lên server và không
            ai khác đọc được.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Giới hạn tần suất truy cập (rate limit)</h2>
          <p>
            Để chống spam/quá tải, các API công khai của LEIBO đếm số lượt
            gọi theo địa chỉ IP trong một cửa sổ thời gian ngắn. Số đếm này
            chỉ giữ tạm trong bộ nhớ server, không lưu trữ lâu dài, không gắn
            với danh tính nào khác.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Không có quảng cáo, không theo dõi bên thứ ba</h2>
          <p>
            Trang web hiện tại không nhúng bất kỳ công cụ phân tích lượt
            truy cập (analytics), quảng cáo, hay theo dõi bên thứ ba nào.
            Nếu điều này thay đổi trong tương lai, chúng tôi sẽ cập nhật lại
            trang này trước.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Liên hệ</h2>
          <p>
            Có thắc mắc về quyền riêng tư? Liên hệ qua kênh cộng đồng của
            LEIBO (xem trang chủ).
          </p>
        </section>
      </div>
    </div>
  );
}
