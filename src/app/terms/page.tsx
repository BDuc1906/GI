
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng — LEIBO",
  description: "Điều khoản sử dụng trang tra cứu dữ liệu Genshin Impact LEIBO.",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 prose-invert">
      <h1 className="font-display text-3xl font-bold text-primary mb-6">
        Điều khoản sử dụng
      </h1>

      <div className="space-y-6 text-sm text-secondary leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Về LEIBO</h2>
          <p>
            LEIBO là trang tra cứu dữ liệu Genshin Impact do người hâm mộ
            thực hiện, phi lợi nhuận, không thu phí, không liên kết chính
            thức với miHoYo/HoYoverse.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Bản quyền dữ liệu và hình ảnh</h2>
          <p>
            Toàn bộ tên nhân vật, vũ khí, thánh di vật, hình ảnh, và dữ liệu
            trò chơi hiển thị trên LEIBO thuộc bản quyền của miHoYo/HoYoverse.
            LEIBO chỉ tổng hợp và hiển thị lại cho mục đích tra cứu, không
            claim quyền sở hữu với bất kỳ tài sản nào trong số đó.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Miễn trừ trách nhiệm</h2>
          <p>
            Dữ liệu trên LEIBO được tổng hợp từ nhiều nguồn công khai và có
            thể chưa cập nhật kịp mỗi khi trò chơi ra bản mới, hoặc còn sai
            sót. LEIBO không chịu trách nhiệm cho bất kỳ quyết định nào
            (trong game hay ngoài đời) dựa trên dữ liệu hiển thị ở đây — hãy
            đối chiếu lại trong game trước khi đưa ra quyết định quan trọng.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Ngừng hoạt động</h2>
          <p>
            LEIBO có thể ngừng hoạt động hoặc thay đổi nội dung bất kỳ lúc
            nào mà không cần báo trước, do đây là dự án phi lợi nhuận vận
            hành bởi cộng đồng.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-primary mb-2">Yêu cầu gỡ bỏ nội dung</h2>
          <p>
            Nếu bạn là chủ sở hữu bản quyền và muốn yêu cầu gỡ bỏ nội dung cụ
            thể, vui lòng liên hệ qua kênh cộng đồng của LEIBO (xem trang
            chủ).
          </p>
        </section>
      </div>
    </div>
  );
}
