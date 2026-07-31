/**
 * Script debug độc lập — KHÔNG đụng vào DB, chỉ in ra để mắt thường kiểm tra.
 *
 * Chạy: npx tsx scripts/debug-traveler.ts
 *
 * Vòng 2: verify cách tra "nhân vật nào dùng sách nào" bằng chính
 * genshindb.characters(seriesName, { matchCategories: true }) — theo README
 * chính thức, "talent level-up material types" là category hợp lệ của hàm
 * characters(). Script này in xem Traveler xuất hiện trong các series nào,
 * và bằng tên gọi nào (để seed-characters.ts match đúng).
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

function section(title: string) {
  console.log("\n" + "=".repeat(60));
  console.log(title);
  console.log("=".repeat(60));
}

const KNOWN_TALENT_BOOK_SERIES = [
  "Freedom", "Resistance", "Ballad",
  "Prosperity", "Diligence", "Gold",
  "Transience", "Elegance", "Light",
  "Admonition", "Ingenuity", "Praxis",
  "Equity", "Justice", "Order",
  "Contention", "Kindling", "Conflict",
  "Moonlight", "Elysium", "Vagrancy",
];

section("Test: genshindb.characters(seriesName, { matchCategories: true })");
console.log("Kiểm tra từng series sách có hoạt động không, và Traveler (nếu có) được liệt kê bằng tên gì.\n");

let anyTravelerFound = false;

for (const series of KNOWN_TALENT_BOOK_SERIES) {
  try {
    const names = genshindb.characters(series, { matchCategories: true }) as string[] | undefined;
    if (!names) {
      console.log(`[${series}] -> undefined (series này không tồn tại/không có data trong bản hiện tại)`);
      continue;
    }
    const travelerLike = names.filter(
      (n) => n.toLowerCase().includes("traveler") || n === "Aether" || n === "Lumine"
    );
    if (travelerLike.length) {
      anyTravelerFound = true;
      console.log(`[${series}] (${names.length} nhân vật) — có Traveler:`, travelerLike);
    } else {
      console.log(`[${series}] (${names.length} nhân vật) — không thấy Traveler/Aether/Lumine`);
    }
  } catch (err) {
    console.log(`[${series}] -> LỖI:`, (err as Error).message);
  }
}

section("Kết luận");
if (anyTravelerFound) {
  console.log("✔ Traveler CÓ được liệt kê trong ít nhất 1 series — xem tên chính xác ở trên,");
  console.log("  đối chiếu với mảng candidates trong seed-characters.ts (seedTraveler) để đảm bảo khớp.");
} else {
  console.log("✘ Traveler KHÔNG xuất hiện trong bất kỳ series sách nào qua matchCategories.");
  console.log("  => genshin-db (bản đang cài) không phân loại Traveler theo category sách talent.");
  console.log("  => bookType sẽ tiếp tục là null cho Traveler một cách CHÍNH ĐÁNG (không phải bug),");
  console.log("     vì không có nguồn data-driven nào trong thư viện này để suy luận nó.");
  console.log("  => Nếu muốn có số liệu chính xác cho Traveler, cách khả thi duy nhất là hardcode");
  console.log("     bằng tay theo dữ liệu công khai đã verify (mình đã gửi kèm gợi ý trong chat),");
  console.log("     KHÔNG nên tiếp tục đoán field/API của genshin-db nữa.");
}