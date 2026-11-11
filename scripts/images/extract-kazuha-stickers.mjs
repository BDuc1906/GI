import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "public/local-genshin-assets/characters/stickers/kazuha");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function downloadKazuhaStickers() {
  console.log("🍁 Đang lấy toàn bộ stickers chính thức của Kaedehara Kazuha từ HoYoLAB CDN...");

  const res = await fetch("https://bbs-api-os.hoyolab.com/community/pendant/wapi/pendant/list?last_id=0&page_size=999&series_id=70&type=3");
  const data = await res.json();
  const list = data.data?.list || [];

  // Danh sách các set có sự xuất hiện của Kazuha kèm nhãn mô tả
  const kazuhaCollections = [
    {
      setQuery: "Set 7",
      title: "Paimon's Paintings Set 7 (Ra mắt Kazuha V1.6)",
      stickers: [
        { index: 0, name: "kazuha_01_leaf_flute.png", label: "Thổi lá phong" },
        { index: 1, name: "kazuha_02_surprised.png", label: "Ngạc nhiên" },
        { index: 2, name: "kazuha_03_thinking.png", label: "Trầm ngâm" },
        { index: 3, name: "kazuha_04_nap_relax.png", label: "Nghỉ ngơi" },
      ],
    },
    {
      setQuery: "Set 11",
      title: "Paimon's Paintings Set 11 (Inazuma Chương 2)",
      stickers: [
        { index: 12, name: "kazuha_05_tea_sip.png", label: "Thưởng trà" },
        { index: 13, name: "kazuha_06_smile_gentle.png", label: "Mỉm cười dịu dàng" },
        { index: 14, name: "kazuha_07_wind_listening.png", label: "Lắng nghe ngọn gió" },
        { index: 15, name: "kazuha_08_slash_ready.png", label: "Sẵn sàng rút kiếm" },
      ],
    },
    {
      setQuery: "Set 16",
      title: "Paimon's Paintings Set 16 (Lễ Hội Irodori V2.6)",
      stickers: [
        { index: 4, name: "kazuha_09_maple_leaf.png", label: "Cầm lá phong đỏ" },
        { index: 5, name: "kazuha_10_poem_recite.png", label: "Ngâm thơ Haiku" },
        { index: 6, name: "kazuha_11_grilled_fish.png", label: "Ăn cá nướng" },
        { index: 7, name: "kazuha_12_sleep_peaceful.png", label: "Ngủ dưới bóng cây" },
      ],
    },
    {
      setQuery: "Set 25",
      title: "Paimon's Paintings Set 25",
      stickers: [
        { index: 0, name: "kazuha_13_chibi_wave.png", label: "Vẫy tay chào" },
        { index: 1, name: "kazuha_14_sparkle_eyes.png", label: "Mắt lấp lánh" },
        { index: 2, name: "kazuha_15_curious.png", label: "Hiếu kỳ" },
        { index: 3, name: "kazuha_16_satisfied.png", label: "Hài lòng" },
      ],
    },
    {
      setQuery: "Set 28",
      title: "Paimon's Paintings Set 28",
      stickers: [
        { index: 4, name: "kazuha_17_travel_wander.png", label: "Lãng khách phiêu lưu" },
        { index: 5, name: "kazuha_18_autumn_breeze.png", label: "Gió thu phảng phất" },
      ],
    },
  ];

  let downloadedCount = 0;

  for (const col of kazuhaCollections) {
    const foundSet = list.find((s) => s.title.includes(col.setQuery));
    if (!foundSet || !foundSet.details) {
      console.warn(`Không tìm thấy set: ${col.setQuery}`);
      continue;
    }

    console.log(`\n📦 ${col.title}:`);

    for (const item of col.stickers) {
      const detail = foundSet.details[item.index];
      if (!detail || !detail.url) continue;

      const rawUrl = detail.url.split("?")[0];
      const destPath = path.join(OUT_DIR, item.name);

      try {
        const imgRes = await fetch(rawUrl);
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          fs.writeFileSync(destPath, buf);
          downloadedCount++;
          console.log(`  ✅ [${downloadedCount}] ${item.name} (${(buf.length / 1024).toFixed(1)} KB) — ${item.label}`);
        }
      } catch (err) {
        console.warn(`  ❌ Thất bại: ${item.name}`, err.message);
      }
    }
  }

  // TẠO MANIFEST STICKER KAZUHA
  const manifest = {
    character: "Kaedehara Kazuha",
    vision: "Anemo",
    region: "Inazuma",
    totalStickers: downloadedCount,
    folder: "/local-genshin-assets/characters/stickers/kazuha/",
    stickers: fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".png")).map((f) => ({
      file: f,
      url: `/local-genshin-assets/characters/stickers/kazuha/${f}`,
    })),
  };

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("\n" + "=".repeat(60));
  console.log(`🎉 HOÀN THÀNH: Đã lưu ${downloadedCount} stickers của Kazuha tại:`);
  console.log(OUT_DIR);
  console.log("=".repeat(60));
}

downloadKazuhaStickers().catch(console.error);
