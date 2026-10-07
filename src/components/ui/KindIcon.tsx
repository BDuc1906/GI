import type { ReactNode } from "react";

export type EntityKind =
  | "enemy"
  | "food"
  | "animal"
  | "place"
  | "namecard"
  | "outfit"
  | "glider"
  | "achievement"
  | "craft";

const PATHS: Record<EntityKind, ReactNode> = {
  enemy: (
    <>
      <circle cx="12" cy="11" r="7" />
      <circle cx="9.5" cy="11" r="1.3" />
      <circle cx="14.5" cy="11" r="1.3" />
      <path d="M9 18v2.5h6V18" />
    </>
  ),
  food: (
    <>
      <path d="M4 12h16a8 8 0 0 1-16 0z" />
      <path d="M8 5c0 1.6 1 1.6 1 3.2M12 4c0 1.6 1 1.6 1 3.2M16 5c0 1.6 1 1.6 1 3.2" />
    </>
  ),
  animal: (
    <>
      <circle cx="6.5" cy="10" r="1.9" />
      <circle cx="10.5" cy="6.5" r="1.9" />
      <circle cx="15.5" cy="7" r="1.9" />
      <circle cx="18.5" cy="11.5" r="1.9" />
      <path d="M8 17.5c0-3 3-5 5-5s5 2 5 5-3 3-5 3-5 0-5-3z" />
    </>
  ),
  place: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  namecard: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 10h6M7 14h10" />
    </>
  ),
  outfit: <path d="M8 4 3 7l2 4 3-1v10h8V10l3 1 2-4-5-3a4 4 0 0 1-8 0z" />,
  glider: <path d="M3 15c5 0 9-3 12-9 1 5 3 7 6 8-4 0-6 1-8 4-3-3-6-3-10-3z" />,
  achievement: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6" />
    </>
  ),
  craft: (
    <>
      <path d="m14 6 4 4-8 8-4-4z" />
      <path d="m5 19 3-3" />
    </>
  ),
};

/**
 * [KHÔNG CÒN DÙNG] Biểu tượng placeholder theo loại, do dự án tự vẽ.
 * Bản EntityThumb mới nhất đã bỏ file này (hiện chữ cái đầu thay vì icon tự vẽ).
 * Chỉ giữ lại để bản EntityThumb cũ (lượt trước) vẫn biên dịch được.
 */
export function KindIcon({ kind }: { kind: EntityKind }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="w-1/2 h-1/2 opacity-60"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[kind]}
    </svg>
  );
}
