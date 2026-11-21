import { ListPageLayout, ListLoadingSkeleton } from "@/components/list-layout";

/**
 * Loading skeleton đồng bộ chuẩn cho trang Nhân vật LEIBO v1.0.
 * Khớp hoàn toàn cấu trúc layout, tỷ lệ ảnh 3:4 và hệ thống cột responsive.
 */
export default function Loading() {
  return (
    <ListPageLayout>
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/40 animate-pulse">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-elevated" />
            <div className="h-8 w-48 rounded-lg bg-bg-elevated" />
            <div className="h-5 w-12 rounded-full bg-bg-elevated" />
          </div>
          <div className="h-4 w-64 rounded bg-bg-elevated/70" />
        </div>
      </div>

      {/* Filter toolbar skeleton */}
      <div className="h-20 rounded-2xl border border-border/60 bg-bg-card/40 animate-pulse mb-8" />

      {/* Grid skeleton */}
      <ListLoadingSkeleton count={24} variant="character" />
    </ListPageLayout>
  );
}
