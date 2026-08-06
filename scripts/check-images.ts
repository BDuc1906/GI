import { prisma } from "../src/lib/prisma";

async function checkImages() {
  // Characters
  const characters = await prisma.character.findMany({
    select: { id: true, name: true, iconUrl: true, splashUrl: true },
  });
  const missingIcon = characters.filter(c => !c.iconUrl);
  const missingSplash = characters.filter(c => !c.splashUrl);
  console.log(`Characters: ${characters.length}, missing icon: ${missingIcon.length}, missing splash: ${missingSplash.length}`);
  if (missingIcon.length > 0) {
    console.log("Sample missing icon:", missingIcon.slice(0, 5).map(c => c.name));
  }

  // Weapons
  const weapons = await prisma.weapon.findMany({
    select: { id: true, name: true, iconUrl: true },
  });
  const missingWeaponIcon = weapons.filter(w => !w.iconUrl);
  console.log(`Weapons: ${weapons.length}, missing icon: ${missingWeaponIcon.length}`);

  // Artifacts
  const artifacts = await prisma.artifactSet.findMany({
    select: { id: true, name: true, iconUrl: true },
  });
  const missingArtifactIcon = artifacts.filter(a => !a.iconUrl);
  console.log(`Artifacts: ${artifacts.length}, missing icon: ${missingArtifactIcon.length}`);

  // Materials
  const materials = await prisma.material.findMany({
    select: { id: true, name: true, iconUrl: true },
  });
  const missingMaterialIcon = materials.filter(m => !m.iconUrl);
  console.log(`Materials: ${materials.length}, missing icon: ${missingMaterialIcon.length}`);
  if (missingMaterialIcon.length > 0) {
    console.log("Sample missing material icons:", missingMaterialIcon.slice(0, 10).map(m => m.name));
  }
}

checkImages();