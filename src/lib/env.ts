/**
 * Validate các biến môi trường bắt buộc NGAY khi module này được import
 * (từ src/lib/prisma.ts) — thay vì để app khởi động "thành công" rồi crash
 * mơ hồ ở lần query DB đầu tiên (lỗi Prisma/pg thường khó đọc, không nói rõ
 * thiếu biến nào). Fail sớm với thông báo rõ ràng giúp debug nhanh hơn
 * nhiều, đặc biệt khi deploy lên môi trường mới (Vercel, VPS...) quên set
 * env.
 */
const REQUIRED_ENV_VARS = ["DATABASE_URL"] as const;

function assertUrlLike(name: string, value: string): void {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    throw new Error(
      `Biến môi trường "${name}" có giá trị nhưng không phải URL hợp lệ. ` +
        `Kiểm tra lại file .env (xem .env.example để biết định dạng đúng).`
    );
  }
}

export function assertEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Thiếu biến môi trường bắt buộc: ${missing.join(", ")}.\n` +
        `Copy .env.example → .env và điền giá trị thật trước khi chạy app.`
    );
  }

  for (const name of REQUIRED_ENV_VARS) {
    assertUrlLike(name, process.env[name] as string);
  }
}