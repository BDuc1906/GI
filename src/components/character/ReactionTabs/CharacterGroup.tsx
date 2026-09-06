import { characterPillStyle } from "@/lib/game/element-reactions-data";

/**
 * Chip tên nhân vật — tô theo ĐÚNG nguyên tố (Vision) riêng của từng
 * nhân vật (characterPillStyle, tra CHARACTER_ELEMENT trong data file),
 * KHÔNG gộp chung 1 màu cho cả nhóm nữa — trước đây cả nhóm (Sóng 1,
 * Witch mới, Khải Huyền...) dùng chung 1 màu tím/hồng, trong khi 1 nhóm
 * vẫn có nhiều nguyên tố khác nhau (vd Sóng 1 có cả Hỏa/Lôi/Phong/Thủy/
 * Nham), nên gộp màu theo nhóm không phản ánh đúng nguyên tố nhân vật.
 */
export function CharacterGroup({ label, names }: { label: string; names: readonly string[] }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] text-text-muted mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <span
            key={name}
            className="text-xs px-3 py-1.5 rounded-full border font-medium"
            style={characterPillStyle(name)}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
