"use client";

import { useState } from "react";

/**
 * Icon loại vũ khí (Sword / Claymore / Polearm / Bow / Catalyst) dùng cho
 * các chip lọc (vd trang /weapons, /characters).
 *
 * LỊCH SỬ / TẠI SAO KHÔNG LÀM KIỂU KHÁC — đọc trước khi sửa file này:
 *
 * 1) Bản đầu tiên: hotlink ảnh từ static.wikia.nocookie.net (Fandom).
 *    -> KHÔNG phải asset gốc của game, chỉ do người dùng wiki tự upload,
 *       đường dẫn đổi/xoá liên tục, đôi khi bị chặn hotlink -> icon chết.
 *
 * 2) Bản thứ hai: tự vẽ icon bằng SVG tay (đúng hình dáng kiếm/cung/...)
 *    -> Không còn bị chết link, nhưng KHÔNG phải icon thật trong game
 *       (chỉ là icon minh hoạ), nên vẫn sai tinh thần "chuẩn Genshin".
 *
 * 3) Bản này (đúng): game không xuất bản riêng một bộ "icon loại vũ khí"
 *    dễ lấy — bảng Weapon chỉ có iconUrl cho TỪNG vũ khí cụ thể (đã mirror
 *    thật từ CDN chính chủ mihoyo qua scripts/mirror-images-to-r2.ts).
 *    Vì vậy, để mỗi loại vũ khí có MỘT icon thật 100% từ game, ta dùng
 *    icon của một vũ khí đại diện cho từng loại — cùng nguồn ảnh chính
 *    chủ mihoyo (upload-os-bbs.mihoyo.com/game_record/genshin/equip/...)
 *    mà pipeline seed-weapons.ts của dự án đang dùng cho MỌI vũ khí khác.
 *    Đây KHÔNG phải icon random — là ảnh vũ khí thật, xác nhận từ dữ liệu
 *    genshin-db (nguồn: GenshinData/Dimbreath datamine + mihoyo CDN).
 *
 * Vũ khí đại diện được chọn (đều là vũ khí khởi đầu quen thuộc, chắc chắn
 * tồn tại ổn định qua các bản cập nhật):
 *   Sword    -> Dull Blade            (UI_EquipIcon_Sword_Blunt)
 *   Claymore -> Waster Greatsword     (UI_EquipIcon_Claymore_Aniki)
 *   Polearm  -> Beginner's Protector  (UI_EquipIcon_Pole_Gewalt)
 *   Bow      -> Hunter's Bow          (UI_EquipIcon_Bow_Hunters)
 *   Catalyst -> Apprentice's Notes    (UI_EquipIcon_Catalyst_Apprentice)
 *
 * Nếu về sau muốn đổi vũ khí đại diện, hoặc muốn lấy động từ DB (vd vũ khí
 * 5★ nổi bật nhất mỗi loại) thay vì hardcode — nên làm ở lớp server (query
 * prisma.weapon theo type) rồi truyền iconUrl xuống qua prop, KHÔNG quay
 * lại việc hotlink domain ngoài không kiểm soát được (wikia, v.v).
 */

const WEAPON_TYPE_ICON_URLS: Record<string, string> = {
  Sword: "https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/UI_EquipIcon_Sword_Blunt.png",
  Claymore: "https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/UI_EquipIcon_Claymore_Aniki.png",
  Polearm: "https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/UI_EquipIcon_Pole_Gewalt.png",
  Bow: "https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/UI_EquipIcon_Bow_Hunters.png",
  Catalyst: "https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/UI_EquipIcon_Catalyst_Apprentice.png",
};

// Ảnh R2 đã được xác minh truy cập công khai (HTTP 200) trong báo cáo
// scripts/data/r2-check-report-*.json. Đi qua proxy /api/images nên không phụ
// thuộc CDN mihoyo (hay chết link) — mihoyo chỉ còn là phương án dự phòng.
const WEAPON_TYPE_R2_URLS: Record<string, string> = {
  Sword: "/api/images/weapons/dull-blade/icon.png",
  Claymore: "/api/images/weapons/waster-greatsword/icon.png",
  Polearm: "/api/images/weapons/beginner-s-protector/icon.png",
  Bow: "/api/images/weapons/hunter-s-bow/icon.png",
  Catalyst: "/api/images/weapons/apprentice-s-notes/icon.png",
};

export function WeaponIcon({
  type,
  size = 16,
  className = "",
}: {
  type: string;
  size?: number;
  className?: string;
}) {
  // 0 = R2 (proxy) -> 1 = mihoyo -> 2 = chữ cái đầu
  const [stage, setStage] = useState(0);
  const normalized = type.trim();
  const r2Url = WEAPON_TYPE_R2_URLS[normalized];
  const mihoyoUrl = WEAPON_TYPE_ICON_URLS[normalized];
  const url = stage === 0 ? r2Url ?? mihoyoUrl : stage === 1 ? mihoyoUrl : undefined;

  if (!url) {
    // Loại lạ hoặc ảnh lỗi thật sự (mất mạng, CDN down...) -> fallback chữ
    // cái đầu, không bịa icon giả để tránh gây hiểu nhầm là icon thật.
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 text-[10px] font-medium text-text-muted ${className}`}
        style={{ width: size, height: size }}
      >
        {normalized.slice(0, 1)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={normalized}
      width={size}
      height={size}
      loading="lazy"
      className={`inline-block shrink-0 object-contain ${className}`}
      onError={() => setStage((s) => (s === 0 && r2Url && mihoyoUrl ? 1 : 2))}
    />
  );
}
