// scripts/update-character-builds.ts
// Hệ thống tự động kiểm tra, đồng bộ và giám sát độ bao phủ build nhân vật so với DB.
import "dotenv/config";
import { prisma } from "../src/lib/db/prisma";
import { CHARACTER_BUILDS, getCharacterBuild } from "../src/data/character-builds-data";
import { NON_PLAYABLE_CHARACTER_IDS } from "../src/core/game/character-catalog";

async function main() {
  console.log("=================================================");
  console.log("GI - HE THONG CAP NHAT VA KIEM DINH BUILD NHAN VAT");
  console.log("=================================================\n");

  const [dbCharacters, dbWeapons, dbArtifacts] = await Promise.all([
    prisma.character.findMany({
      select: { id: true, name: true, vision: true, weaponType: true, rarity: true },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
    }),
    prisma.weapon.findMany({ select: { id: true, name: true } }),
    prisma.artifactSet.findMany({ select: { id: true, name: true } }),
  ]);

  const nonPlayableSet = new Set<string>(NON_PLAYABLE_CHARACTER_IDS as readonly string[]);
  const playable = dbCharacters.filter((c) => !nonPlayableSet.has(c.id));
  const dbCharacterIds = new Set(dbCharacters.map((c) => c.id));
  const dbWeaponIds = new Set(dbWeapons.map((w) => w.id));
  const dbArtifactIds = new Set(dbArtifacts.map((a) => a.id));

  console.log(`Tong nhan vat trong DB: ${dbCharacters.length}`);
  console.log(`Nhan vat co the choi: ${playable.length}`);

  // 1. Kiểm tra tính hợp lệ của dữ liệu trong CHARACTER_BUILDS
  let invalidWeaponsCount = 0;
  let invalidArtifactsCount = 0;
  let invalidTeammatesCount = 0;

  for (const [charId, build] of Object.entries(CHARACTER_BUILDS)) {
    // Kiem tra vu khi
    if (build.weapons) {
      for (const w of build.weapons) {
        if (!dbWeaponIds.has(w.weaponId)) {
          console.warn(`[WARN] Nhan vat '${charId}': Vu khi '${w.weaponId}' khong ton tai trong DB.`);
          invalidWeaponsCount++;
        }
      }
    }

    // Kiem tra thanh di vat
    if (build.artifacts) {
      for (const a of build.artifacts) {
        for (const setId of a.setIds) {
          if (!dbArtifactIds.has(setId)) {
            console.warn(`[WARN] Nhan vat '${charId}': Bo TDV '${setId}' khong ton tai trong DB.`);
            invalidArtifactsCount++;
          }
        }
      }
    }

    // Kiem tra doi hinh
    if (build.teams) {
      for (const team of build.teams) {
        for (const tmId of team.teammateIds) {
          if (!dbCharacterIds.has(tmId)) {
            console.warn(`[WARN] Nhan vat '${charId}' (Team '${team.nameVi}'): Dong doi '${tmId}' khong ton tai trong DB.`);
            invalidTeammatesCount++;
          }
        }
      }
    }
  }

  // 2. Thong ke do bao phu
  let coveredCount = 0;
  const missing: typeof playable = [];

  for (const c of playable) {
    const build = getCharacterBuild(c.id);
    if (build) {
      coveredCount++;
    } else {
      missing.push(c);
    }
  }

  const coveragePercent = ((coveredCount / playable.length) * 100).toFixed(1);

  console.log("\n---------------- KET QUA KIEM TRA ----------------");
  console.log(`- So nhan vat co build chuyen sau: ${coveredCount}/${playable.length} (${coveragePercent}%)`);
  console.log(`- So nhan vat su dung build dong (auto-logic): ${missing.length}`);
  console.log(`- Vu khi khong hop le: ${invalidWeaponsCount}`);
  console.log(`- Bo TDV khong hop le: ${invalidArtifactsCount}`);
  console.log(`- Dong doi khong hop le: ${invalidTeammatesCount}`);

  if (missing.length > 0) {
    console.log("\nTop nhan vat 5 sao chua co build thu cong (dang dung engine dong):");
    const missing5Star = missing.filter((c) => c.rarity === 5).slice(0, 15);
    missing5Star.forEach((c) => {
      console.log(`  * ${c.id.padEnd(24)} [${c.vision.padEnd(7)} | ${c.weaponType.padEnd(8)}]`);
    });
  }

  console.log("\n[OK] He thong tu dong san sang. Cac nhan vat chua co build thu cong se tu dong sinh build qua KQM dynamic engine.");
}

main()
  .catch((err) => {
    console.error("Loi khi chay update-character-builds:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
