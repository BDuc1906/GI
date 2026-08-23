import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SafeImage } from "@/components/SafeImage";
import { SectionHeading } from "@/components/SectionHeading";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { Breadcrumb } from "@/components/Breadcrumb";
import { rarityColorVar } from "@/lib/theme";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "ArtifactDetail" });
  const a = await prisma.artifactSet.findUnique({ where: { id } });
  if (!a) return { title: t("notFoundTitle") };
  return {
    title: `${a.name} — LEIBO`,
    description: a.fourPieceBonus ?? a.twoPieceBonus ?? t("metaDescriptionFallback", { range: a.rarityRange.join("/") }),
  };
}

function resolvePieceImage(val: unknown): string | null {
  if (typeof val === "string") return val || null;
  if (val && typeof val === "object") {
    const filename = (val as Record<string, unknown>).filename;
    if (typeof filename === "string" && filename) return `https://enka.network/ui/${filename}.png`;
  }
  return null;
}

function resolvePieceName(val: unknown, key: string, pieceLabels: Record<string, string>): string {
  if (val && typeof val === "object") {
    const name = (val as Record<string, unknown>).name;
    if (typeof name === "string" && name) return name;
  }
  return pieceLabels[key] ?? key;
}

export default async function ArtifactDetail({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ArtifactDetail" });

  const PIECE_LABELS: Record<string, string> = {
    flower: t("pieceFlower"),
    plume: t("piecePlume"),
    sands: t("pieceSands"),
    goblet: t("pieceGoblet"),
    circlet: t("pieceCirclet"),
  };

  const a = await prisma.artifactSet.findUnique({ where: { id } });
  if (!a) return notFound();

  const pieces = (a.pieces as Record<string, unknown>) ?? {};
  const maxRarity = Math.max(...(a.rarityRange as number[]), 4);
  const rc = rarityColorVar(maxRarity);

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: t("breadcrumbArtifacts"), path: "/artifacts" },
    { name: a.name, path: `/artifacts/${a.id}` },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <div className="surface-card overflow-hidden mb-10" style={{ borderTop: `2.5px solid ${rc}` }}>
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          {a.iconUrl && (
            <div
              className="relative w-40 h-40 rounded-xl bg-bg-elevated shrink-0"
              style={{ border: `1px solid color-mix(in srgb, ${rc} 35%, var(--border-color))` }}
            >
              <SafeImage
                src={a.iconUrl}
                alt={a.name}
                fill
                sizes="160px"
                className="object-contain p-3"
                fallbackClassName="w-full h-full flex items-center justify-center text-text-muted text-[10px]"
              />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <span className="text-eyebrow mb-2" style={{ color: rc }}>{t("artifactSetLabel")}</span>
            <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">{a.name}</h1>
            <p className="text-sm font-semibold" style={{ color: rc }}>{a.rarityRange.join("/")}★</p>
          </div>
        </div>
      </div>

      <section className="mb-10 space-y-3">
        {a.onePieceBonus && (
          <div className="surface-card p-4">
            <div className="font-semibold text-text-primary mb-1">{t("onePieceEffect")}</div>
            <p className="text-sm text-text-secondary leading-relaxed">{a.onePieceBonus}</p>
          </div>
        )}
        {a.twoPieceBonus && (
          <div className="surface-card p-4">
            <div className="font-semibold text-text-primary mb-1">{t("twoPieceEffect")}</div>
            <p className="text-sm text-text-secondary leading-relaxed">{a.twoPieceBonus}</p>
          </div>
        )}
        {a.fourPieceBonus && (
          <div className="surface-card p-4" style={{ borderColor: `color-mix(in srgb, ${rc} 30%, var(--border-color))` }}>
            <div className="font-semibold mb-1" style={{ color: rc }}>{t("fourPieceEffect")}</div>
            <p className="text-sm text-text-secondary leading-relaxed">{a.fourPieceBonus}</p>
          </div>
        )}
      </section>

      <section>
        <SectionHeading elementColor={rc}>{t("piecesInSet")}</SectionHeading>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
          {Object.entries(pieces).map(([key, val]) => {
            if (!val) return null;
            const imgUrl = resolvePieceImage(val);
            const pieceName = resolvePieceName(val, key, PIECE_LABELS);

            return (
              <div key={key} className="surface-card p-4 flex flex-col items-center text-center group">
                <div className="relative w-16 h-16 mb-3 bg-bg-elevated rounded-lg overflow-hidden flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                  {imgUrl ? (
                    <SafeImage
                      src={imgUrl}
                      alt={pieceName}
                      fill
                      sizes="64px"
                      className="object-contain"
                      fallbackClassName="w-full h-full flex items-center justify-center text-text-muted text-[10px]"
                    />
                  ) : (
                    <div className="text-text-muted text-[10px]">No Image</div>
                  )}
                </div>
                <div className="text-eyebrow mb-1">{PIECE_LABELS[key] ?? key}</div>
                <div className="font-semibold text-text-primary line-clamp-2 text-xs" title={pieceName}>
                  {pieceName}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}