// Chạy: node test-db-connection.mjs
// (đặt file này ở gốc project D:\GI, cùng cấp package.json, vì cần đọc .env)
//
// Test kết nối THẲNG tới Neon bằng "pg" thuần, không qua Prisma, không qua
// withDbRetry, không qua Next.js — để biết chắc chắn DB có kết nối được hay
// không, tách bạch khỏi mọi lớp retry/timeout đã thêm vào app.
import { Pool } from "pg";
import { readFileSync } from "fs";

// Đọc DATABASE_URL trực tiếp từ .env (không cần cài dotenv)
const envContent = readFileSync(".env", "utf-8");
const match = envContent.match(/^DATABASE_URL=(.+)$/m);
const rawUrl = match ? match[1].trim().replace(/^["']|["']$/g, "") : process.env.DATABASE_URL;

if (!rawUrl) {
  console.error("Không tìm thấy DATABASE_URL trong .env");
  process.exit(1);
}

const url = new URL(rawUrl);
url.searchParams.delete("sslmode");

console.log("Đang thử kết nối tới:", url.hostname);
console.log("Bắt đầu:", new Date().toISOString());

const pool = new Pool({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: true },
  connectionTimeoutMillis: 15_000,
});

const start = Date.now();
try {
  const client = await pool.connect();
  console.log(`✅ Kết nối thành công sau ${Date.now() - start}ms`);
  const res = await client.query("SELECT 1 as ok, now() as server_time");
  console.log("Kết quả query:", res.rows[0]);
  client.release();
} catch (err) {
  console.error(`❌ Kết nối THẤT BẠI sau ${Date.now() - start}ms`);
  console.error("Loại lỗi:", err.constructor.name);
  console.error("Message:", err.message);
  console.error("Code:", err.code);
} finally {
  await pool.end();
  process.exit(0);
}
