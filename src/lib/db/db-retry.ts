/**
 * Neon free tier tự "ngủ" (suspend) compute khi không có hoạt động. Lúc build
 * (Next.js prerender `/sitemap.xml` và các route dùng `generateStaticParams`),
 * nếu compute vừa ngủ lại ngay sau bước migrate, lần kết nối đầu tiên qua
 * pooler đôi khi bị từ chối thẳng (ECONNREFUSED) thay vì đợi compute thức
 * dậy. Bọc query bằng retry ngắn để build không fail vì đúng khoảnh khắc đó.
 *
 * BUG ĐÃ SỬA (lần 1): điều kiện retry TRƯỚC ĐÂY chỉ nhận biết đúng 1 kịch bản
 * duy nhất — compute ĐANG ngủ, kết nối bị từ chối thẳng (err.code ===
 * "ECONNREFUSED"). Nhưng kịch bản THỰC TẾ hay gặp hơn lúc runtime (dev
 * server chạy lâu, không phải lúc build) là compute ĐANG THỨC nhưng
 * Neon tự đóng kết nối giữa chừng vì idle timeout — Prisma báo lỗi khác
 * hẳn: `PrismaClientKnownRequestError` với `err.code === "P1017"`
 * ("Server has closed the connection"), bọc trong đó còn có
 * `err.cause` kiểu `DriverAdapterError` tên "ConnectionClosed". Vì
 * "P1017" !== "ECONNREFUSED", điều kiện cũ luôn false → hàm KHÔNG BAO
 * GIỜ retry cho đúng trường hợp đang xảy ra trong log thực tế, ném lỗi
 * ngay ở lần thử đầu tiên bất kể `retries` truyền vào là bao nhiêu —
 * khiến việc bọc withDbRetry ở các trang tuần trước KHÔNG có tác dụng.
 *
 * BUG ĐÃ SỬA (lần 2 — bản này): điều kiện nhận diện lỗi đã đúng, nhưng
 * `retries: 3` (mặc định cũ) không đủ margin so với pool `max: 3` trong
 * `prisma.ts`. Khi dev server đứng yên một lúc, Neon có thể đóng CẢ 3
 * connection idle trong pool gần như cùng lúc. Mỗi lần retry chỉ loại bỏ
 * đúng connection vừa fail ra khỏi pool, không phải cả 3 — nên với 2 query
 * chạy song song trong `Promise.all` (như ở domains/page.tsx), cần vừa đủ
 * số lần retry để "dọn sạch" hết connection chết trước khi có connection
 * mới sống sót. `retries: 3` (4 lần thử) sát nút ngay bằng đúng pool size,
 * dễ hụt khi có nhiều hơn 1 query cùng cạnh tranh pool. Tăng lên `retries:
 * 5` để có margin thật sự, và thêm jitter để các query chạy song song
 * không đồng loạt retry cùng một thời điểm rồi cùng vồ phải 1 connection
 * vừa được tạo lại.
 *
 * Nhận diện rộng hơn, cả 3 dấu hiệu của "kết nối chết, thử lại sẽ sống
 * lại" (không retry các lỗi khác như lỗi cú pháp query, ràng buộc dữ
 * liệu... vì retry những lỗi đó chỉ tổ chờ vô ích rồi vẫn fail y hệt):
 *   - err.code === "ECONNREFUSED" (kịch bản build cũ)
 *   - err.code === "P1017" (Prisma: "Server has closed the connection")
 *   - err.code === "P1001" (Prisma: không kết nối được tới DB server)
 *   - err.cause?.name === "DriverAdapterError" kèm message chứa
 *     "ConnectionClosed" (driver adapter báo kết nối đã đóng, dù vì lý
 *     do gì cũng nên coi là đáng retry)
 *
 * BUG ĐÃ SỬA (lần 3): thêm `connectionTimeoutMillis` ở `prisma.ts` để chặn
 * việc treo request vô hạn khi Neon không phản hồi lại lộ ra một kịch bản
 * thứ 4: khi `pg-pool` tự kill 1 lần thử connect mới vì vượt quá
 * `connectionTimeoutMillis` (Neon cold-start chậm hơn timeout đã đặt),
 * nó chỉ SỬA ĐÈ `err.message` thành "Connection terminated due to
 * connection timeout" trên một `Error` thường — KHÔNG có `.code`, KHÔNG
 * có `.cause` (xem `pg-pool/index.js`, hàm `newClient`). Không có field
 * nào để bắt bằng `.code` như 3 trường hợp trên, nên phải nhận diện thêm
 * qua nội dung message. Đây vẫn là lỗi đáng retry — bản chất chỉ là
 * "chưa thức dậy kịp trong lần thử này", lần sau compute đã tỉnh thì kết
 * nối bình thường.
 */
function isRetryableDbError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const code = "code" in err ? (err as { code?: string }).code : undefined;
  if (code === "ECONNREFUSED" || code === "P1017" || code === "P1001") return true;

  if (/connection terminated due to connection timeout/i.test(err.message)) return true;
  if (/timeout exceeded when trying to connect/i.test(err.message)) return true;

  const cause = "cause" in err ? (err as { cause?: unknown }).cause : undefined;
  if (cause instanceof Error) {
    const causeName = cause.name ?? "";
    const causeMessage = cause.message ?? "";
    if (causeName.includes("DriverAdapterError") && /connectionclosed/i.test(causeMessage)) return true;
    if (/connection terminated due to connection timeout/i.test(causeMessage)) return true;
  }
  return false;
}

export async function withDbRetry<T>(
  fn: () => Promise<T>,
  { retries = 5, delayMs = 800 }: { retries?: number; delayMs?: number } = {}
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryableDbError(err) || attempt === retries) throw err;
      // Jitter (0-300ms) để nhiều query chạy song song (vd. Promise.all
      // findMany + count) không retry đúng cùng 1 thời điểm rồi cùng
      // tranh chấp connection vừa được pool tạo lại.
      const backoff = delayMs * (attempt + 1) + Math.random() * 300;
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  throw lastError;
}
