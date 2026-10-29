import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getWikiaUrl(wiki: string, filename: string): string {
  const hash = crypto.createHash("md5").update(filename).digest("hex");
  return `https://static.wikia.nocookie.net/${wiki}/images/${hash[0]}/${hash.slice(0, 2)}/${filename}`;
}

const ICONS_TO_DOWNLOAD = [
  { target: "craft.png", wikiaFile: "Icon_Crafting_Small.png" },
  { target: "alchemy.png", wikiaFile: "UI_Alchemy.png" },
  { target: "food.png", wikiaFile: "Icon_Cooking_Small.png" },
  { target: "items.png", wikiaFile: "Icon_Inventory.png" },
  { target: "enemy.png", wikiaFile: "Archive_Menu_Living_Beings_Enemies_and_Monsters.png" },
  { target: "animal.png", wikiaFile: "Archive_Menu_Living_Beings_Wildlife.png" },
  { target: "geography.png", wikiaFile: "Archive_Menu_Geography.png" },
  { target: "achievement.png", wikiaFile: "Icon_Achievements.png" },
  { target: "party.png", wikiaFile: "Icon_Party_Setup.png" },
  { target: "handbook.png", wikiaFile: "Icon_Adventurer_Handbook.png" },
];

export async function downloadAuthenticIcons(): Promise<void> {
  const destDir = path.join(__dirname, "../public/local-genshin-assets/ui");
  for (const { target, wikiaFile } of ICONS_TO_DOWNLOAD) {
    const url = getWikiaUrl("gensin-impact", wikiaFile);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const destPath = path.join(destDir, target);
        fs.writeFileSync(destPath, Buffer.from(buffer));
        console.log(`✔ Saved ${target} (${buffer.byteLength} bytes)`);
      }
    } catch (err) {
      console.error(`❌ Error downloading ${wikiaFile}:`, (err as Error).message);
    }
  }
}
