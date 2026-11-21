"use client";

import Link from "next/link";
import { EntityVisual } from "@/components/ui/EntityVisual";

export interface DomainMaterialReward {
  name: string;
  artifactSetId?: string;
  materialId?: string;
}

interface DomainCardProps {
  id: string;
  name: string;
  categoryLabel?: string;
  regionName?: string | null;
  recommendedLevel?: number | null;
  imageUrl?: string | null;
  imageUrlOriginal?: string | null;
  materials?: DomainMaterialReward[];
}

export function DomainCard({
  id,
  name,
  categoryLabel,
  regionName,
  recommendedLevel,
  imageUrl,
  imageUrlOriginal,
  materials = [],
}: DomainCardProps) {
  const previewMats = materials.slice(0, 3);

  return (
    <Link
      href={`/domains/${id}`}
      className="surface-card rounded-2xl overflow-hidden group border border-border/80 hover:border-accent-500 hover:shadow-lg transition-all duration-200 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-accent-500/40"
    >
      {/* ── ART TRANH BÍ CẢNH TRÀN VIỀN PHÍA TRÊN ── */}
      <div className="relative w-full aspect-[16/9] sm:h-44 bg-bg-elevated overflow-hidden">
        <EntityVisual
          entityType="domain"
          entityId={id}
          alt={name}
          initialSrc={imageUrl}
          fallbackSrcs={[imageUrlOriginal, "/local-genshin-assets/ui/domain.png"]}
          size="fill"
          aspectRatio="landscape"
          fit="cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="group-hover:scale-105 transition-transform duration-500"
        />
        {/* Lớp phủ gradient tạo chiều sâu cho chữ và nền */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-black/25 pointer-events-none" />
      </div>

      {/* ── NỘI DUNG THÔNG TIN BÍ CẢNH ── */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold text-text-primary text-base group-hover:text-accent-bright transition-colors line-clamp-2">
            {name}
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {[
              categoryLabel,
              regionName,
              recommendedLevel ? `Lv.${recommendedLevel}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        {previewMats.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
            <span className="text-[11px] text-text-muted shrink-0">Rớt:</span>
            <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
              {previewMats.map((m, idx) => {
                const isArt = Boolean(m.artifactSetId);
                const entId = m.artifactSetId || m.materialId || m.name;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1 bg-bg-elevated/70 px-1.5 py-0.5 rounded border border-border/40 text-[11px] text-text-secondary"
                    title={m.name}
                  >
                    <EntityVisual
                      entityType={isArt ? "artifact" : "material"}
                      entityId={entId}
                      alt={m.name}
                      size="xs"
                      wrapperClassName="w-4 h-4 rounded overflow-hidden shrink-0"
                    />
                    <span className="truncate max-w-[90px]">{m.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
