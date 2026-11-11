import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "public/local-genshin-assets/characters/stickers/kazuha");
fs.mkdirSync(OUT_DIR, { recursive: true });

async function getKazuhaStickers() {
  console.log("🔍 Đang tìm kiếm sticker của Kaedehara Kazuha từ Fandom Wiki & HoYoLAB...");

  const res = await fetch("https://genshin-impact.fandom.com/wiki/Kaedehara_Kazuha/Gallery", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Lỗi khi fetch trang gallery: ${res.status}`);
  }

  const html = await res.text();

  // Tìm toàn bộ link ảnh có chứa emoji, sticker, paimon painting liên quan đến Kazuha
  const regex = /https:\/\/static\.wikia\.nocookie\.net\/gensin-impact\/images\/[a-zA-Z0-9\/]+(?:\.png|\.gif|\.jpg|\.webp)/gi;
  const allUrls = [...html.matchAll(regex)].map((m) => m[0].split("/revision")[0]);

  const kazuhaStickerKeywords = [
    "Emoji",
    "Sticker",
    "Paimon%27s_Paintings",
    "Kazuha_1",
    "Kazuha_2",
    "Kazuha_3",
    "Kazuha_4",
    "Kazuha_5",
    "Kazuha_6",
    "Kazuha_7",
    "Kazuha_8",
    "Kazuha_9",
    "Kazuha_10",
    "Kazuha_Tea",
    "Kazuha_Flute",
    "Kazuha_Sleep",
    "Kazuha_Wind",
    "Kazuha_Cat",
    "Kazuha_Slash",
    "Kazuha_Leaf",
    "Chibi",
  ];

  const matchedUrls = new Set();

  for (const url of allUrls) {
    const filename = decodeURIComponent(url.split("/").pop() || "");
    const isKazuha = filename.toLowerCase().includes("kazuha");
    const isEmojiOrSticker = kazuhaStickerKeywords.some((k) =>
      filename.toLowerCase().includes(decodeURIComponent(k).toLowerCase())
    );

    if (isKazuha && (isEmojiOrSticker || filename.toLowerCase().includes("emoji") || filename.toLowerCase().includes("icon"))) {
      matchedUrls.add(url);
    }
  }

  console.log(`🎯 Tìm thấy ${matchedUrls.size} stickers & chibi icons của Kazuha!`);

  let count = 0;
  for (const url of matchedUrls) {
    const rawName = decodeURIComponent(url.split("/").pop() || `kazuha_sticker_${count}.png`);
    const cleanName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const outPath = path.join(OUT_DIR, cleanName);

    try {
      const imgRes = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        if (buffer.length > 500) {
          fs.writeFileSync(outPath, buffer);
          count++;
          console.log(`✅ [${count}/${matchedUrls.size}] Đã lưu: ${cleanName} (${(buffer.length / 1024).toFixed(1)} KB)`);
        }
      }
    } catch (err) {
      console.warn(`⚠️ Không thể tải: ${cleanName}`, err.message);
    }
  }

  // Danh sách sticker chính thức bổ sung trực tiếp từ Paimon's Paintings
  const officialPaimonPaintings = [
    {
      name: "Icon_Emoji_Paimon's_Paintings_07_Kaedehara_Kazuha_1.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/1/14/Icon_Emoji_Paimon%27s_Paintings_07_Kaedehara_Kazuha_1.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_07_Kaedehara_Kazuha_2.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/0/05/Icon_Emoji_Paimon%27s_Paintings_07_Kaedehara_Kazuha_2.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_07_Kaedehara_Kazuha_3.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/e/e0/Icon_Emoji_Paimon%27s_Paintings_07_Kaedehara_Kazuha_3.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_07_Kaedehara_Kazuha_4.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/5/52/Icon_Emoji_Paimon%27s_Paintings_07_Kaedehara_Kazuha_4.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_11_Kaedehara_Kazuha_1.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/2/2f/Icon_Emoji_Paimon%27s_Paintings_11_Kaedehara_Kazuha_1.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_16_Kaedehara_Kazuha_1.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/7/7b/Icon_Emoji_Paimon%27s_Paintings_16_Kaedehara_Kazuha_1.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_16_Kaedehara_Kazuha_2.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/8/86/Icon_Emoji_Paimon%27s_Paintings_16_Kaedehara_Kazuha_2.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_16_Kaedehara_Kazuha_3.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/1/1a/Icon_Emoji_Paimon%27s_Paintings_16_Kaedehara_Kazuha_3.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_16_Kaedehara_Kazuha_4.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/5/5e/Icon_Emoji_Paimon%27s_Paintings_16_Kaedehara_Kazuha_4.png",
    },
    {
      name: "Icon_Emoji_Paimon's_Paintings_25_Kaedehara_Kazuha_1.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/3/30/Icon_Emoji_Paimon%27s_Paintings_25_Kaedehara_Kazuha_1.png",
    },
    {
      name: "Kaedehara_Kazuha_Birthday_2021.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/0/07/Kaedehara_Kazuha_Birthday_2021.png",
    },
    {
      name: "Kaedehara_Kazuha_Birthday_2022.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/9/91/Kaedehara_Kazuha_Birthday_2022.png",
    },
    {
      name: "Kaedehara_Kazuha_Birthday_2023.png",
      url: "https://static.wikia.nocookie.net/gensin-impact/images/c/c5/Kaedehara_Kazuha_Birthday_2023.png",
    },
  ];

  for (const item of officialPaimonPaintings) {
    const cleanName = item.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const outPath = path.join(OUT_DIR, cleanName);
    if (!fs.existsSync(outPath)) {
      try {
        const imgRes = await fetch(item.url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (imgRes.ok) {
          const buffer = Buffer.from(await imgRes.arrayBuffer());
          if (buffer.length > 500) {
            fs.writeFileSync(outPath, buffer);
            count++;
            console.log(`✅ [Bổ sung chính thức] Đã lưu: ${cleanName}`);
          }
        }
      } catch {}
    }
  }

  console.log(`\n🎉 HOÀN THÀNH: Đã lưu toàn bộ ${count} stickers của Kazuha tại:\n${OUT_DIR}`);
}

getKazuhaStickers().catch(console.error);
