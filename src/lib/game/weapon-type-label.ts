/**
 * Nhãn loại vũ khí (Sword/Claymore/Polearm/Bow/Catalyst) đa ngôn ngữ —
 * key trong namespace "WeaponType" (messages/*.json) trùng CHÍNH XÁC với
 * giá trị enum lưu trong DB (Weapon.type, Character.weaponType), nên chỉ
 * cần t(type) trực tiếp, không cần bảng map trung gian.
 */
export function getWeaponTypeLabel(t: (key: string) => string, type: string): string {
  try {
    return t(type);
  } catch {
    return type;
  }
}
