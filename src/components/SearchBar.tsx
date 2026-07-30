
"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

/**
 * Ô tìm kiếm đặt trên header, dùng chung cho mọi trang. Submit form thay vì
 * search-as-you-type để tránh gọi DB liên tục mỗi phím gõ (không có API
 * route riêng — trang /search vẫn query trực tiếp bằng Server Component,
 * giữ đúng pattern hiện có của dự án, không cần thêm tầng API cho việc này).
 */
export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xs ml-auto">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm nhân vật, vũ khí, thánh di vật..."
        aria-label="Tìm kiếm"
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900/60 px-3 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-[color:var(--gold)]/50 transition-colors"
      />
    </form>
  );
}
