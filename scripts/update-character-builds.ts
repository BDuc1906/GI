// scripts/update-character-builds.ts
/**
 * LEIBO - BỘ MÁY KIỂM ĐỊNH & GIÁM SÁT TIẾN ĐỘ BUILD NHÂN VẬT (BUILD VALIDATION GATE)
 *
 * Kiểm tra 4 tầng (Structural, Gameplay, Calculation, Human Review) cho toàn bộ Multi-Profile Builds.
 * Đồng thời giám sát tính toàn vẹn của Legacy Curated Builds và Drafts.
 * Đóng vai trò là Build Gate trong CI/CD ngăn chặn đưa build lỗi lên Production.
 */

import "dotenv/config";
import { prisma } from "../src/lib/db/prisma";
import { CHARACTER_BUILDS, getBuildSource } from "../src/data/character-builds-data";
import { DRAFT_BUILDS } from "../src/data/character-builds-draft";
import { NON_PLAYABLE_CHARACTER_IDS } from "../src/core/game/character-catalog";
import { MULTI_PROFILE_BUILDS } from "../src/core/build-profile";
import { BuildProfileValidator } from "../src/core/build-profile/validator";

async function main() {
  console.log("========================================================================");
  console.log("LEIBO - HE THONG KIEM DINH BUILD NHAN VAT CHUAN KQM & KQMS 20-ROLL");
  console.log("========================================================================\n");

  const [dbCharacters, dbWeapons, dbArtifacts] = await Promise.all([
    prisma.character.findMany({
      select: { id: true, name: true, vision: true, weaponType: true, rarity: true },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
    }),
    prisma.weapon.findMany({ select: { id: true, name: true, type: true } }),
    prisma.artifactSet.findMany({ select: { id: true, name: true } }),
  ]);

  const nonPlayableSet = new Set<string>(NON_PLAYABLE_CHARACTER_IDS as readonly string[]);
  const playable = dbCharacters.filter((c) => !nonPlayableSet.has(c.id));
  const dbCharacterIds = new Set(dbCharacters.map((c) => c.id));
  const dbWeaponIds = new Set(dbWeapons.map((w) => w.id));
  const dbArtifactIds = new Set(dbArtifacts.map((a) => a.id));

  console.log(`[INFO] Tong nhan vat trong DB: ${dbCharacters.length}`);
  console.log(`[INFO] Nhan vat co the choi (Playable Roster): ${playable.length}\n`);

  // ── PHẦN 1: KIỂM ĐỊNH 4 TẦNG MULTI-PROFILE BUILDS (KQM STANDARDS) ──
  console.log(">>> [TANG 1 - 4] KIEM DINH HO SO BUILD DA LOI CHOI (MULTI-PROFILE)...");
  const validator = new BuildProfileValidator();
  let multiProfileCount = 0;
  let verifiedMultiCount = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const [charId, multiBuild] of Object.entries(MULTI_PROFILE_BUILDS)) {
    console.log(`\n• Kiem tra nhan vat: ${multiBuild.characterName} (${charId}) - ${multiBuild.profiles.length} profiles:`);
    for (const prof of multiBuild.profiles) {
      multiProfileCount++;
      if (prof.sourceMetadata.reviewStatus === "VERIFIED") verifiedMultiCount++;

      const valResult = await validator.validate(prof);
      const errors = valResult.issues.filter((i) => i.severity === "error");
      const warnings = valResult.issues.filter((i) => i.severity === "warning");

      if (errors.length > 0) {
        totalErrors += errors.length;
        console.error(`  [X] Profile '${prof.profileId}' (${prof.nameVi}): ${errors.length} ERROR(S)`);
        for (const e of errors) {
          console.error(`      - [${e.layer}] ${e.message}`);
        }
      } else {
        console.log(`  [OK] Profile '${prof.profileId}' [${prof.sourceMetadata.reviewStatus}] - ${prof.nameVi}`);
      }

      if (warnings.length > 0) {
        totalWarnings += warnings.length;
        for (const w of warnings) {
          console.warn(`      ! [WARN] [${w.layer}] ${w.message}`);
        }
      }
    }
  }

  // ── PHẦN 2: KIỂM TRA TÍNH TOÀN VẸN CỦA LEGACY CURATED & DRAFTS ──
  console.log("\n>>> KIEM TRA TINH TOAN VEN CUA LEGACY CURATED & DRAFTS...");
  let invalidWeaponsCount = 0;
  let invalidArtifactsCount = 0;
  let invalidTeammatesCount = 0;

  const legacyBuilds: Array<[string, (typeof CHARACTER_BUILDS)[string]]> = [
    ...Object.entries(CHARACTER_BUILDS),
    ...Object.entries(DRAFT_BUILDS),
  ];

  for (const [charId, build] of legacyBuilds) {
    if (build.weapons) {
      for (const w of build.weapons) {
        if (!dbWeaponIds.has(w.weaponId)) {
          console.warn(`[WARN] Legacy '${charId}': Vu khi '${w.weaponId}' khong ton tai.`);
          invalidWeaponsCount++;
        }
      }
    }

    if (build.artifacts) {
      for (const a of build.artifacts) {
        for (const setId of a.setIds) {
          if (!dbArtifactIds.has(setId)) {
            console.warn(`[WARN] Legacy '${charId}': Bo TDV '${setId}' khong ton tai.`);
            invalidArtifactsCount++;
          }
        }
      }
    }

    if (build.teams) {
      for (const team of build.teams) {
        for (const tmId of team.teammateIds) {
          if (!dbCharacterIds.has(tmId)) {
            console.warn(`[WARN] Legacy '${charId}' (${team.nameVi}): Dong doi '${tmId}' khong ton tai.`);
            invalidTeammatesCount++;
          }
        }
      }
    }
  }

  // ── PHẦN 3: THỐNG KÊ COVERAGE & PHÂN LOẠI TIẾN ĐỘ ──
  let curatedCount = 0;
  let draftCount = 0;
  const missing: typeof playable = [];

  for (const c of playable) {
    const source = getBuildSource(c.id);
    if (source === "curated") curatedCount++;
    else if (source === "draft") draftCount++;
    else missing.push(c);
  }

  const coveragePercent = ((curatedCount / playable.length) * 100).toFixed(1);

  console.log("\n========================================================================");
  console.log("TONG KET KIEM DINH BUILD DATABASE");
  console.log("========================================================================");
  console.log(`- Nhan vat Playable:                  ${playable.length}`);
  console.log(`- Multi-Profile KQM Profiles:         ${multiProfileCount} profiles (${Object.keys(MULTI_PROFILE_BUILDS).length} nhan vat)`);
  console.log(`- Multi-Profile Verified KQM:         ${verifiedMultiCount} profiles`);
  console.log(`- Build bien tap (Curated/Verified):  ${curatedCount}/${playable.length} (${coveragePercent}%)`);
  console.log(`- Ban nhap chua duyet (Draft):        ${draftCount}/${playable.length}`);
  console.log(`- Chua co build rieng (Missing/Auto): ${missing.length}/${playable.length}`);
  console.log(`- Loi kiem dinh 4 tang (Errors):      ${totalErrors}`);
  console.log(`- Canh bao kiem dinh (Warnings):      ${totalWarnings}`);
  console.log(`- Vu khi legacy khong ton tai:        ${invalidWeaponsCount}`);
  console.log(`- Bo TDV legacy khong ton tai:        ${invalidArtifactsCount}`);
  console.log(`- Dong doi legacy khong ton tai:      ${invalidTeammatesCount}`);

  if (missing.length > 0) {
    console.log("\n[ROSTER COVERAGE GAPS] Top 10 nhan vat 5 sao can soan Multi-Profile KQM tiep theo:");
    const missing5Star = missing.filter((c) => c.rarity === 5).slice(0, 10);
    missing5Star.forEach((c) => {
      console.log(`  * ${c.name.padEnd(24)} [${c.vision.padEnd(8)} | ${c.weaponType.padEnd(8)} | ID: ${c.id}]`);
    });
  }

  const hasFatalErrors = totalErrors > 0 || invalidWeaponsCount > 0 || invalidArtifactsCount > 0;
  if (hasFatalErrors) {
    console.error("\n[CI GATE FAIL] Phat hien loi nghiem trong trong Build Database! Khong cho phep deploy production.");
    process.exitCode = 1;
  } else {
    console.log("\n[CI GATE PASS] Toan bo Multi-Profile Builds va Legacy Builds deu hop le!");
  }
}

main()
  .catch((err) => {
    console.error("Loi khi chay update-character-builds:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
