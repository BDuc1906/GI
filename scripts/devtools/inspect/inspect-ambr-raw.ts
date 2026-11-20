/**
 * scripts/inspect-ambr-raw.ts
 *
 * MỤC ĐÍCH: Lấy nguyên văn JSON mà Ambr API trả về cho 1 nhân vật, để XÁC
 * MINH cấu trúc field thật (đặc biệt phần talent/passive) TRƯỚC KHI viết
 * code compare — tránh đoán mò tên field rồi viết code sai mà không biết.
 *
 * Bản thân comment gốc trong AmbrProvider.ts đã nói rõ: cấu trúc field
 * của Ambr "CHƯA được verify bằng response thật" — script này để verify.
 *
 * CHẠY (tại D:\GI, cần có mạng ra Internet bình thường):
 *   npx tsx scripts/inspect-ambr-raw.ts 10000071
 *   (10000071 = ID của Cyno trên Ambr; đổi ID để xem nhân vật khác)
 *
 * KẾT QUẢ: in ra toàn bộ JSON, và ghi thêm ra file ambr-raw-<id>.json để
 * xem lại dễ hơn (JSON đầy đủ khá dài).
 */
import { writeFileSync } from "node:fs";

const BASE_URL = process.env.AMBR_API_BASE_URL || "https://api.ambr.top/v2/en";
const id = process.argv[2];

if (!id) {
  console.error("Thiếu ID nhân vật. Vd: npx tsx scripts/inspect-ambr-raw.ts 10000071 (Cyno)");
  process.exit(1);
}

async function main() {
  const url = `${BASE_URL}/avatar/${id}`;
  console.log(`📡 Đang gọi: ${url}\n`);

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.error(`❌ Ambr trả về lỗi ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const json = await res.json();
  const outFile = `ambr-raw-${id}.json`;
  writeFileSync(outFile, JSON.stringify(json, null, 2), "utf-8");

  console.log(`✅ Đã lưu JSON đầy đủ vào: ${outFile}\n`);

  // In riêng phần liên quan talent/passive để dễ đọc ngay trên console,
  // không cần mở file JSON dài.
  const data = (json as { data?: Record<string, unknown> }).data;
  if (data) {
    console.log("🔑 Danh sách key cấp cao nhất (top-level) mà Ambr trả về:");
    console.log(Object.keys(data));

    for (const key of Object.keys(data)) {
      if (/talent|skill|passive|affix/i.test(key)) {
        console.log(`\n📦 Nội dung field "${key}" (nghi ngờ liên quan talent/passive):`);
        console.log(JSON.stringify((data as Record<string, unknown>)[key], null, 2).slice(0, 3000));
      }
    }
  }
}

main().catch((err) => {
  console.error("❌ Lỗi:", err);
  process.exit(1);
});
