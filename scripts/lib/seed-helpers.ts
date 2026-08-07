/**
 * scripts/lib/seed-helpers.ts
 *
 * Lớp DB (Prisma) trên nền logic thuần ở ./genshin-pure-helpers.ts. File
 * này CHỈ nên chứa phần thật sự cần Prisma (`upsertMaterial` ghi vào bảng
 * Material) — mọi hàm không đụng DB đã chuyển sang genshin-pure-helpers.ts
 * và được re-export lại đây để các script cũ (`import {...} from
 * "./lib/seed-helpers"`) không phải sửa gì cả.
 */

import type { Prisma } from "@prisma/client";
import {
  getEnkaUrl,
  getElementIconUrl,
  getBestImageUrl,
  slugify,
  getMaterialIconFilename,
} from "./genshin-pure-helpers";

export { getEnkaUrl, getElementIconUrl, getBestImageUrl, slugify, getMaterialIconFilename };

/**
 * Kiểu thật của genshindb.materials(): hỗ trợ cả dạng tra 1 tên
 * ("Vayuda Turquoise Sliver") lẫn dạng liệt kê tên ("names", { matchCategories }).
 */
type MaterialsFn = (
  name: string,
  options?: { matchCategories?: boolean }
) => unknown;

// Danh sách tên nguyên liệu KHÔNG tra được icon — in tổng kết ở cuối run
// thay vì im lặng bỏ qua.
export const MATERIALS_MISSING_ICON: string[] = [];

export function printMissingIconSummary(): void {
  if (MATERIALS_MISSING_ICON.length === 0) {
    console.log("✔ Mọi nguyên liệu đều tra được icon.");
    return;
  }
  const unique = Array.from(new Set(MATERIALS_MISSING_ICON));
  console.warn(
    `\n⚠ ${unique.length} nguyên liệu KHÔNG tra được icon (sẽ hiện "-" trên web):`
  );
  console.warn(unique.map((n) => `   - ${n}`).join("\n"));
  console.warn(
    `→ Nguyên nhân thường gặp: bản "genshin-db" đang cài chưa có data cho nguyên liệu ` +
    `vùng mới ra (vd Natlan). Thử "npm install genshin-db@latest" rồi seed lại.\n` +
    `  Nếu vẫn thiếu sau khi update, package cộng đồng đó chưa kịp cập nhật —\n` +
    `  cần map icon tay tạm thời cho các tên này (xem MANUAL_ICON_OVERRIDES).`
  );
}

// Fallback tay cho nguyên liệu mà genshin-db chưa có data (vd nội dung vùng
// mới ra mắt). Nạp từ scripts/data/image-overrides.json qua
// loadManualOverrides() (xem seed-characters.ts) thay vì hard-code ở đây —
// để sửa 1 override không cần sửa code, chỉ cần sửa file JSON.
export let MANUAL_ICON_OVERRIDES: Record<string, string> = {};

export function loadManualOverrides(overrides: Record<string, string>) {
  MANUAL_ICON_OVERRIDES = overrides;
}

/**
 * upsert 1 nguyên liệu vào bảng Material, tra icon từ genshin-db theo 3 bước
 * dự phòng (trực tiếp -> chuẩn hóa tên -> dò trong danh sách tên).
 *
 * Quan trọng: mỗi bước tra cứu được bọc try/catch RIÊNG (qua `tryLookup`).
 * Nếu bước 1 ném lỗi (một số version của genshin-db throw thay vì trả về
 * giá trị rỗng khi không khớp tên), hàm vẫn tiếp tục thử bước 2 + 3 thay vì
 * nhảy thẳng ra ngoài bỏ qua luôn các bước dự phòng.
 *
 * Đây là hàm DUY NHẤT trong toàn bộ pipeline crawl+seed thật sự ghi vào DB
 * khi "resolve" 1 material — cả GenshinDbAdapter (fetch) lẫn
 * buildAscensionMaterialPhases/buildTalentMaterialLevels (thuần) đều chỉ
 * trả về {name, count}; bước seed-characters.ts gọi hàm này để đổi name
 * thành materialId trước khi lưu vào cột JSON của Character.
 *
 * SỞ HỮU CỘT ẢNH: `iconUrl` (cột hiển thị) chỉ được set ở nhánh `create`
 * (record vừa tạo, chưa có ảnh nào để mirror). Ở nhánh `update` KHÔNG được
 * đụng vào `iconUrl` nữa — cột đó do scripts/mirror-images-to-r2.ts sở hữu
 * sau khi đã mirror sang R2 lần đầu. Hàm này chỉ tự do ghi đè
 * `iconUrlOriginal` (bản ghi "genshin-db nói icon hiện tại là gì") ở cả 2
 * nhánh. Xem comment chi tiết tại Character.iconUrlOriginal trong
 * prisma/schema.prisma để hiểu lý do tách 2 cột.
 */
export async function upsertMaterial(
  prisma: {
    material: {
      upsert: (args: Prisma.MaterialUpsertArgs) => Promise<unknown>;
    };
  },
  genshindb: { materials: MaterialsFn },
  materialName: string
): Promise<string> {
  const id = slugify(materialName);
  let iconUrl: string | null = null;

  const tryLookup = (name: string): unknown => {
    try {
      return genshindb.materials(name);
    } catch {
      return null;
    }
  };

  // 1. Lấy trực tiếp
  let raw = tryLookup(materialName);

  // 2. Chuẩn hóa tên (bỏ dấu, viết thường) — chỉ chạy nếu bước 1 không ra kết quả
  if (!raw) {
    const normalized = materialName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
    if (normalized) raw = tryLookup(normalized);
  }

  // 3. Tìm trong danh sách tên — chỉ chạy nếu 2 bước trên đều không ra kết quả
  if (!raw) {
    try {
      const allNames = genshindb.materials("names", { matchCategories: true }) as string[];
      const match = allNames.find((n) => n.toLowerCase() === materialName.toLowerCase());
      if (match) raw = tryLookup(match);
    } catch {
      // Không lấy được danh sách tên -> bỏ qua, iconUrl vẫn null
    }
  }

  if (raw) {
    iconUrl = getEnkaUrl(getMaterialIconFilename(raw), null);
  }

  // Vẫn không có icon sau cả 3 bước tra genshin-db -> thử override tay,
  // rồi ghi nhận vào danh sách thiếu để in cảnh báo tổng kết cuối run.
  if (!iconUrl) {
    const override = MANUAL_ICON_OVERRIDES[materialName];
    if (override) {
      iconUrl = getEnkaUrl(override, null);
    } else {
      MATERIALS_MISSING_ICON.push(materialName);
    }
  }

  await prisma.material.upsert({
    where: { id },
    create: { id, name: materialName, iconUrl, iconUrlOriginal: iconUrl },
    update: { iconUrlOriginal: iconUrl },
  });
  return id;
}