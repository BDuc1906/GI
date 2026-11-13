"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/layout/SectionHeading";

export interface StickerItem {
  id: string;
  name: string;
  src: string;
  category: string;
}

const KAZUHA_STICKERS: StickerItem[] = [
  { id: "1", name: "Thổi lá phong", category: "Paimon's Paintings 07", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_01_leaf_flute.png" },
  { id: "2", name: "Ngạc nhiên", category: "Paimon's Paintings 07", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_02_surprised.png" },
  { id: "3", name: "Trầm ngâm", category: "Paimon's Paintings 07", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_03_thinking.png" },
  { id: "4", name: "Nghỉ ngơi yên bình", category: "Paimon's Paintings 07", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_04_nap_relax.png" },
  { id: "5", name: "Thưởng trà đạo", category: "Paimon's Paintings 11", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_05_tea_sip.png" },
  { id: "6", name: "Mỉm cười dịu dàng", category: "Paimon's Paintings 11", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_06_smile_gentle.png" },
  { id: "7", name: "Lắng nghe ngọn gió", category: "Paimon's Paintings 11", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_07_wind_listening.png" },
  { id: "8", name: "Sẵn sàng rút kiếm", category: "Paimon's Paintings 11", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_08_slash_ready.png" },
  { id: "9", name: "Cầm lá phong đỏ", category: "Paimon's Paintings 16", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_09_maple_leaf.png" },
  { id: "10", name: "Ngâm thơ Haiku", category: "Paimon's Paintings 16", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_10_poem_recite.png" },
  { id: "11", name: "Ăn cá nướng", category: "Paimon's Paintings 16", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_11_grilled_fish.png" },
  { id: "12", name: "Ngủ dưới bóng phong", category: "Paimon's Paintings 16", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_12_sleep_peaceful.png" },
  { id: "13", name: "Vẫy tay chào", category: "Paimon's Paintings 25", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_13_chibi_wave.png" },
  { id: "14", name: "Mắt lấp lánh", category: "Paimon's Paintings 25", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_14_sparkle_eyes.png" },
  { id: "15", name: "Hiếu kỳ ngắm nhìn", category: "Paimon's Paintings 25", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_15_curious.png" },
  { id: "16", name: "Hài lòng", category: "Paimon's Paintings 25", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_16_satisfied.png" },
  { id: "17", name: "Lãng khách phiêu lưu", category: "Paimon's Paintings 28", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_17_travel_wander.png" },
  { id: "18", name: "Gió thu phảng phất", category: "Paimon's Paintings 28", src: "/local-genshin-assets/characters/stickers/kazuha/kazuha_18_autumn_breeze.png" },
];

export function CharacterStickerGallery({
  characterId,
  elementColor,
}: {
  characterId: string;
  elementColor: string;
}) {
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Chỉ hiển thị cho Kazuha (hoặc mở rộng sau)
  const isKazuha = characterId.includes("kazuha");
  if (!isKazuha) return null;

  const handleCopy = async (src: string) => {
    try {
      const fullUrl = window.location.origin + src;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <section className="mb-10">
      <SectionHeading elementColor={elementColor}>
        🍁 Bộ Sưu Tập Sticker Chibi Chính Thức ({KAZUHA_STICKERS.length})
      </SectionHeading>

      <div className="bg-bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-sm">
        <p className="text-xs sm:text-sm text-text-secondary mb-4">
          Bộ sticker chibi Paimon&apos;s Paintings chính thức từ HoYoverse với độ phân giải cao. Nhấp vào sticker để xem chi tiết hoặc tải về.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {KAZUHA_STICKERS.map((stk) => (
            <button
              key={stk.id}
              onClick={() => setSelectedSticker(stk)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border/60 bg-bg-primary/50 hover:bg-bg-elevated hover:border-amber-500/50 hover:scale-105 transition-all group relative cursor-pointer"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stk.src}
                  alt={stk.name}
                  className="w-full h-full object-contain filter drop-shadow group-hover:drop-shadow-lg transition-all"
                  loading="lazy"
                />
              </div>
              <span className="text-[11px] font-medium text-text-primary text-center mt-1.5 line-clamp-1 group-hover:text-amber-400 transition-colors">
                {stk.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal xem chi tiết Sticker */}
      {selectedSticker && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedSticker(null)}
        >
          <div
            className="bg-bg-card border border-border max-w-sm w-full rounded-2xl p-6 shadow-2xl relative flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSticker(null)}
              className="absolute top-3 right-3 text-text-muted hover:text-text-primary p-1 text-sm rounded-lg"
            >
              ✕
            </button>

            <div className="text-xs font-mono font-bold text-amber-400 mb-2 uppercase tracking-wider">
              {selectedSticker.category}
            </div>

            <div className="w-36 h-36 relative my-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedSticker.src}
                alt={selectedSticker.name}
                className="w-full h-full object-contain filter drop-shadow-xl"
              />
            </div>

            <h4 className="font-display text-lg font-bold text-text-primary mt-2">
              {selectedSticker.name}
            </h4>

            <div className="flex items-center gap-2 mt-5 w-full">
              <a
                href={selectedSticker.src}
                download={selectedSticker.src.split("/").pop()}
                className="flex-1 py-2 text-center rounded-xl bg-amber-400 hover:bg-amber-300 text-bg-primary font-bold text-xs transition-colors shadow-sm"
              >
                Tải ảnh gốc về máy
              </a>
              <button
                onClick={() => handleCopy(selectedSticker.src)}
                className="px-3.5 py-2 rounded-xl border border-border bg-bg-secondary hover:bg-bg-elevated text-text-primary text-xs font-medium transition-colors"
              >
                {copied ? "Đã copy link! ✓" : "Copy link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
