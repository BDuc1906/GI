/**
 * Genshin Impact Game Icons Helper
 * Lấy icon thật từ database (sử dụng cả iconUrl và iconUrlOriginal)
 * CHỈ DÙNG TRÊN SERVER-SIDE (API routes)
 */

// Map category sang icon game thật (ưu tiên asset local đã tải về)
export async function getGameIcon(category: string): Promise<string> {
  const c = category.toLowerCase().trim();
  switch (c) {
    case 'characters':
    case 'nhân vật':
      return '/local-genshin-assets/ui/characters.png';
    case 'weapons':
    case 'vũ khí':
      return '/local-genshin-assets/ui/sword.png';
    case 'artifacts':
    case 'thánh di vật':
      return '/local-genshin-assets/ui/artifacts.png';
    case 'materials':
    case 'nguyên liệu':
      return '/local-genshin-assets/ui/items.png';
    case 'domains':
    case 'bí cảnh':
      return '/local-genshin-assets/ui/domain.png';
    case 'enemies':
    case 'kẻ địch':
      return '/local-genshin-assets/ui/enemy.png';
    case 'food':
    case 'ẩm thực':
    case 'món ăn':
      return '/local-genshin-assets/ui/food.png';
    case 'crafts':
    case 'chế tạo':
      return '/local-genshin-assets/ui/craft.png';
    case 'animals':
    case 'sinh vật':
      return '/local-genshin-assets/ui/animal.png';
    case 'geography':
    case 'địa lý':
      return '/local-genshin-assets/ui/geography.png';
    case 'namecards':
    case 'danh thiếp':
      return '/local-genshin-assets/ui/namecard.png';
    case 'outfits':
    case 'trang phục':
      return '/local-genshin-assets/ui/outfit.png';
    case 'windgliders':
    case 'dù lượn':
      return '/local-genshin-assets/ui/windglider.png';
    default:
      return '';
  }
}

// Lấy icon tool game thật
export async function getToolIcon(tool: string): Promise<string> {
  const t = tool.toLowerCase().trim();
  switch (t) {
    case 'calendar':
    case 'lịch':
      return '/local-genshin-assets/ui/resin.png';
    case 'team-builder':
    case 'đội hình':
      return '/local-genshin-assets/ui/stardust.png';
    case 'showcase-card':
    case 'showcase':
      return '/local-genshin-assets/ui/calculator-character.png';
    case 'calculator':
    case 'máy tính':
      return '/local-genshin-assets/ui/calculator.png';
    case 'optimizer':
    case 'tối ưu':
      return '/local-genshin-assets/ui/artifacts.png';
    case 'wish':
    case 'cầu nguyện':
      return '/local-genshin-assets/ui/wish.png';
    case 'timeline':
    case 'sự kiện':
      return '/local-genshin-assets/ui/timeline.png';
    default:
      return '';
  }
}

// Lấy ảnh Spiral Abyss (La Hoàn Thâm Cảnh)
export async function getSpiralAbyssImage(): Promise<string> {
  return '/local-genshin-assets/ui/artifacts.png';
}
