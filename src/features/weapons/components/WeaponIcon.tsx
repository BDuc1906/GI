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

const WEAPON_TYPE_LOCAL_URLS: Record<string, string> = {
  Sword: "/local-genshin-assets/ui/sword.png",
  Claymore: "/local-genshin-assets/ui/claymore.png",
  Polearm: "/local-genshin-assets/ui/polearm.png",
  Bow: "/local-genshin-assets/ui/bow.png",
  Catalyst: "/local-genshin-assets/ui/catalyst.png",
};

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
  // 0 = Local game icon -> 1 = R2 proxy -> 2 = letter fallback
  const [stage, setStage] = useState(0);
  const normalized = type.trim();
  const localUrl = WEAPON_TYPE_LOCAL_URLS[normalized];
  const r2Url = WEAPON_TYPE_R2_URLS[normalized];
  const url = stage === 0 ? localUrl ?? r2Url : stage === 1 ? r2Url : undefined;

  if (!url) {
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
      onError={() => setStage((s) => (s === 0 && r2Url ? 1 : 2))}
    />
  );
}
