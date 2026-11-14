/**
 * scripts/images/download-version-key-visuals.mjs
 *
 * Tải về toàn bộ Key Visual / Splashscreen nghệ thuật độc quyền chính thức
 * của từng phiên bản Genshin Impact (ảnh công bố buổi Live Đặc Biệt / Special Program).
 * Lưu tại: public/images/versions/{version}.webp (hoặc .jpg/.png).
 */

import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve(process.cwd(), "public/images/versions");
fs.mkdirSync(OUT_DIR, { recursive: true });

// Bản đồ tên file Splashscreen trên Genshin Fandom theo từng phiên bản
const VERSION_FILES = {
  // 7.x Snezhnaya
  "7.2": ["File:Splashscreen_Hour_of_Ruin.png"],
  "7.1": ["File:Splashscreen_Where_Kristall_Roots_Run_Deep.png"],
  "7.0": ["File:Splashscreen_A_Traveler_on_a_Winter's_Night.png"],

  // 6.x Luna Arc
  "6.2": ["File:Version_Luna_III_Wallpaper_1.png"],
  "6.1": ["File:Version_Luna_II_Wallpaper_1.png"],
  "6.0": ["File:Version_Luna_I_Wallpaper_3.png"],

  // 5.x Natlan
  "5.4": ["File:Version_5.4_Wallpaper_1.png", "File:Splashscreen_Embrace_of_Enchanting_Dreams.png", "File:Version_5.4_Special_Program_Announcement_1.png"],
  "5.3": ["File:Splashscreen_Incandescent_Ode_of_Resurrection.png", "File:Version_5.3_Wallpaper_1.png"],
  "5.2": ["File:Splashscreen_Tapestry_of_Spirit_and_Flame.png", "File:Version_5.2_Wallpaper_1.png"],
  "5.1": ["File:Splashscreen_The_Rainbow_Destined_to_Burn.png", "File:Version_5.1_Wallpaper_1.png"],
  "5.0": ["File:Splashscreen_Flowers_Resplendent_on_the_Sun-Scorched_Sojourn.png", "File:Version_5.0_Wallpaper_1.png"],

  // 4.x Fontaine
  "4.8": ["File:Splashscreen_Summertide_Scales_and_Tales.png", "File:Version_4.8_Wallpaper_1.png"],
  "4.7": ["File:Splashscreen_An_Everlasting_Dream_Intertwined.png", "File:Version_4.7_Wallpaper_1.png"],
  "4.6": ["File:Splashscreen_Two_Worlds_Aflame,_the_Crimson_Night's_Fade.png", "File:Version_4.6_Wallpaper_1.png"],
  "4.5": ["File:Splashscreen_Blades_Weaving_Betwixt_the_Brocade.png", "File:Version_4.5_Wallpaper_1.png"],
  "4.4": ["File:Splashscreen_Vibrant_Harriers_Aloft_in_Spring_Breeze.png", "File:Version_4.4_Wallpaper_1.png"],
  "4.3": ["File:Splashscreen_Roses_and_Muskets.png", "File:Version_4.3_Wallpaper_1.png"],
  "4.2": ["File:Splashscreen_Masquerade_of_the_Guilty.png", "File:Version_4.2_Wallpaper_1.png"],
  "4.1": ["File:Splashscreen_To_the_Stars_Shining_in_the_Depths.png", "File:Version_4.1_Wallpaper_1.png"],
  "4.0": ["File:Splashscreen_As_Light_Rain_Falls_Without_Reason.png", "File:Version_4.0_Wallpaper_1.png"],

  // 3.x Sumeru
  "3.8": ["File:Splashscreen_Secret_Summer_Paradise.png", "File:Version_3.8_Wallpaper_1.png"],
  "3.7": ["File:Splashscreen_Duel!_The_Summoners'_Summit!.png", "File:Version_3.7_Wallpaper_1.png"],
  "3.6": ["File:Splashscreen_A_Parade_of_Providence.png", "File:Version_3.6_Wallpaper_1.png"],
  "3.5": ["File:Splashscreen_Windblume's_Breath.png", "File:Version_3.5_Wallpaper_1.png"],
  "3.4": ["File:Splashscreen_The_Exquisite_Night_Chimes.png", "File:Version_3.4_Wallpaper_1.png"],
  "3.3": ["File:Splashscreen_All_Senses_Clear,_All_Existence_Void.png", "File:Version_3.3_Wallpaper_1.png"],
  "3.2": ["File:Splashscreen_Akasha_Pulses,_the_Kalpa_Flame_Rises.png", "File:Version_3.2_Wallpaper_1.png"],
  "3.1": ["File:Splashscreen_King_Deshret_and_the_Three_Magi.png", "File:Version_3.1_Wallpaper_1.png"],
  "3.0": ["File:Splashscreen_The_Morn_a_Thousand_Roses_Brings.png", "File:Version_3.0_Wallpaper_1.png"],

  // 2.x Inazuma
  "2.8": ["File:Splashscreen_Summer_Fantasia.png", "File:Version_2.8_Wallpaper_1.png"],
  "2.7": ["File:Splashscreen_Hidden_Dreams_in_the_Depths.png", "File:Version_2.7_Wallpaper_1.png"],
  "2.6": ["File:Splashscreen_Zephyr_of_the_Violet_Garden.png", "File:Version_2.6_Wallpaper_1.png"],
  "2.5": ["File:Splashscreen_When_the_Sakura_Bloom.png", "File:Version_2.5_Wallpaper_1.png"],
  "2.4": ["File:Splashscreen_Fleeting_Colors_in_Flight.png", "File:Version_2.4_Wallpaper_1.png"],
  "2.3": ["File:Splashscreen_Shadows_Amidst_Snowstorms.png", "File:Version_2.3_Wallpaper_1.png"],
  "2.2": ["File:Splashscreen_Into_the_Perilous_Labyrinth_of_Fog.png", "File:Version_2.2_Wallpaper_1.png"],
  "2.1": ["File:Splashscreen_Floating_World_Under_the_Moonlight.png", "File:Version_2.1_Wallpaper_1.png"],
  "2.0": ["File:Splashscreen_The_Immovable_God_and_the_Eternal_Euthymia.png", "File:Version_2.0_Wallpaper_1.png"],

  // 1.x Mondstadt / Liyue
  "1.6": ["File:Splashscreen_Midsummer_Island_Adventure.png", "File:Version_1.6_Wallpaper_1.png"],
  "1.5": ["File:Splashscreen_Beneath_the_Light_of_Jadeite.png", "File:Version_1.5_Wallpaper_1.png"],
  "1.4": ["File:Splashscreen_Invitation_of_Windblume.png", "File:Version_1.4_Wallpaper_1.png"],
  "1.3": ["File:Splashscreen_All_That_Glitters.png", "File:Version_1.3_Wallpaper_1.png"],
  "1.2": ["File:Splashscreen_The_Chalk_Prince_and_the_Dragon.png", "File:Version_1.2_Wallpaper_1.png"],
  "1.1": ["File:Splashscreen_A_New_Star_Approaches.png", "File:Version_1.1_Wallpaper_1.png"],
  "1.0": ["File:Splashscreen_Welcome_To_Teyvat.png", "File:Version_1.0_Wallpaper_1.png"],
};

async function fetchImageUrl(fileTitle) {
  const url = `https://genshin-impact.fandom.com/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url&format=json`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    const data = await res.json();
    const pages = Object.values(data.query?.pages || {});
    return pages[0]?.imageinfo?.[0]?.url || null;
  } catch {
    return null;
  }
}

async function downloadFile(url, targetPath) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 5000) return false; // Tránh file hỏng hoặc lỗi
    fs.writeFileSync(targetPath, buffer);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("🎨 Đang thu thập và tải Key Visual chính thức các phiên bản Genshin Impact...");
  
  for (const [version, candidates] of Object.entries(VERSION_FILES)) {
    const targetFile = path.join(OUT_DIR, `${version}.jpg`);
    if (fs.existsSync(targetFile)) {
      const stat = fs.statSync(targetFile);
      if (stat.size > 20000) {
        console.log(`⏩ [Phiên bản ${version}] Đã có sẵn (${(stat.size / 1024).toFixed(0)} KB)`);
        continue;
      }
    }

    let downloaded = false;
    for (const title of candidates) {
      const imgUrl = await fetchImageUrl(title);
      if (imgUrl) {
        const ok = await downloadFile(imgUrl, targetFile);
        if (ok) {
          console.log(`✔ [Phiên bản ${version}] Tải thành công từ ${title}`);
          downloaded = true;
          break;
        }
      }
    }

    if (!downloaded) {
      console.warn(`⚠️ [Phiên bản ${version}] Không tìm thấy Key Visual phù hợp.`);
    }
  }

  console.log("✨ Hoàn tất thu thập Key Visual phiên bản!");
}

main();
