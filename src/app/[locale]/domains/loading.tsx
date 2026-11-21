import { ListPageLayout, ListLoadingSkeleton } from "@/components/list-layout";

export default function Loading() {
  return (
    <ListPageLayout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/40 animate-pulse">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-bg-elevated" />
            <div className="h-8 w-44 rounded-xl bg-bg-elevated" />
            <div className="h-6 w-12 rounded-full bg-bg-elevated" />
          </div>
          <div className="h-4 w-72 rounded bg-bg-elevated/60" />
        </div>
      </div>
      <div className="h-28 w-full rounded-2xl bg-bg-elevated/50 animate-pulse border border-border/60" />
      <ListLoadingSkeleton variant="detailed" count={12} />
    </ListPageLayout>
  );
}
