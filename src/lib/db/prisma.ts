import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { assertEnv } from "../infra/env";

assertEnv();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Bỏ "sslmode" khỏi connection string trước khi đưa cho `pg`. Lý do: ta đã
// khai báo SSL tường minh qua object `ssl` bên dưới — nếu URL còn giữ
// "sslmode=require/prefer/verify-ca", `pg-connection-string` sẽ tự suy ra
// một cấu hình ssl KHÁC từ chính chuỗi đó và log cảnh báo deprecation
// ("these modes will adopt standard libpq semantics..."), dù không ảnh
// hưởng tới kết nối thực tế. Giữ đúng 1 nguồn sự thật (object `ssl`) để
// tắt hẳn cảnh báo thay vì sống chung với nó.
function connectionStringWithoutSslMode(raw: string): string {
  const url = new URL(raw);
  url.searchParams.delete("sslmode");
  return url.toString();
}

// Postgres cục bộ dùng trong CI/test (service container trong
// .github/workflows/ci.yml) và khi chạy `db:migrate`/`db:seed` ở máy dev không
// hỗ trợ TLS — chỉ Neon (production) mới luôn có SSL hợp lệ. Phân biệt theo
// hostname thay vì hardcode 1 cấu hình cho mọi môi trường.
function isLocalDatabase(raw: string): boolean {
  const { hostname } = new URL(raw);
  return hostname === "localhost" || hostname === "127.0.0.1";
}

const rawDatabaseUrl = process.env.DATABASE_URL as string;

// Tạo `pg.Pool` tường minh (thay vì đưa thẳng config cho `PrismaPg`) để có
// thể gắn `pool.on("error", ...)` — xem giải thích bên dưới.
const pool = new Pool({
  connectionString: connectionStringWithoutSslMode(rawDatabaseUrl),
  // Neon (như hầu hết managed Postgres) luôn dùng chứng chỉ SSL hợp lệ, kể cả
  // qua pooler — không có tình huống self-signed cần tắt verify ở dev như
  // một số nhà cung cấp khác, nên bật rejectUnauthorized khi không phải DB
  // local. DB local (CI, docker, dev máy) không hỗ trợ TLS nên tắt hẳn SSL
  // trong trường hợp đó.
  ssl: isLocalDatabase(rawDatabaseUrl) ? false : { rejectUnauthorized: true },
  // Next.js build chạy static generation song song trong NHIỀU worker
  // process (dựa theo số CPU của máy build) — mỗi worker require lại module
  // này và tạo 1 PrismaClient riêng (cache `globalForPrisma` bên dưới chỉ có
  // tác dụng NGOÀI production, để sống sót qua hot-reload lúc dev, không che
  // được trường hợp nhiều process này). Không giới hạn, mỗi client tự mở tối
  // đa `num_cpus*2+1` connection — nhân với số worker sẽ vượt pool Neon cho
  // phép, khiến pooler từ chối kết nối (ECONNREFUSED) đúng lúc build/prerender.
  // Giới hạn nhỏ ở đây, vì lúc build/prerender chỉ cần few connection tuần
  // tự, không cần pool lớn như lúc phục vụ traffic thật.
  max: 3,
  // Neon cold-start (compute vừa suspend, cần "thức dậy") có thể mất hơn
  // 10s trong thực tế — 10s (thử ở bản trước) đã KHÔNG đủ, `pg` tự kill
  // connection đang thiết lập và ném lỗi "Connection terminated due to
  // connection timeout" (xem db-retry.ts, đã bổ sung nhận diện lỗi này).
  // Nới lên 20s để cold-start bình thường không bị cắt ngang giữa chừng,
  // nhưng vẫn không chờ vô hạn (mặc định của `pg` là 0 = chờ mãi) nếu Neon
  // thật sự sập hẳn.
  connectionTimeoutMillis: 20_000,
});

// BUG ĐÃ SỬA: pool trước đây không có error handler. `pg.Pool` tự động dọn
// một client đang IDLE trong pool nếu nó bị server (Neon) đóng kết nối giữa
// chừng (idle timeout phía Neon — không liên quan gì tới app), nhưng khi đó
// pool sẽ emit event "error" ngay trên chính pool object. Đây là hành vi bắt
// buộc phải lắng nghe theo docs của node-postgres: không gắn listener khiến
// Node coi đây là error chưa được xử lý, gây nhiễu log (rất có thể là nguồn
// gốc gián tiếp của MaxListenersExceededWarning thấy trong log dev). Client
// lỗi này KHÔNG đang chạy query nào của app, nên không cần/không nên throw
// ra ứng dụng — chỉ log để biết, `withDbRetry` ở tầng gọi sẽ tự xin connection
// mới trong lần retry kế tiếp.
pool.on("error", (err) => {
  console.warn(
    "[prisma] Idle pg client bị đóng kết nối (thường do Neon tự đóng idle connection, không phải lỗi ứng dụng):",
    err.message
  );
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
