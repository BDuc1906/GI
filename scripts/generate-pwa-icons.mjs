import sharp from "sharp";
import fs from "fs";
import path from "path";

const outDir = path.resolve(process.cwd(), "public/icons");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function createIconSvg(size, isMaskable = false) {
  const diamondSize = isMaskable ? size * 0.45 : size * 0.52;
  const center = size / 2;
  const halfDiamond = diamondSize / 2;

  // Diamond points (rotated square)
  const pTop = `${center},${center - halfDiamond}`;
  const pRight = `${center + halfDiamond},${center}`;
  const pBottom = `${center},${center + halfDiamond}`;
  const pLeft = `${center - halfDiamond},${center}`;

  // Inner subtle diamond
  const innerHalf = halfDiamond * 0.65;
  const ipTop = `${center},${center - innerHalf}`;
  const ipRight = `${center + innerHalf},${center}`;
  const ipBottom = `${center},${center + innerHalf}`;
  const ipLeft = `${center - innerHalf},${center}`;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFE066" />
        <stop offset="50%" stop-color="#F4D03F" />
        <stop offset="100%" stop-color="#D4AC0D" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="${size * 0.04}" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <!-- Background -->
    <rect width="${size}" height="${size}" rx="${isMaskable ? 0 : size * 0.2}" fill="#0d0d0d" />
    
    <!-- Outer Glow -->
    <polygon points="${pTop} ${pRight} ${pBottom} ${pLeft}" fill="#F4D03F" opacity="0.3" filter="url(#glow)" />

    <!-- Main Gold Diamond -->
    <polygon points="${pTop} ${pRight} ${pBottom} ${pLeft}" fill="url(#goldGrad)" stroke="#FFE066" stroke-width="${size * 0.015}" />
    
    <!-- Inner Accent Diamond -->
    <polygon points="${ipTop} ${ipRight} ${ipBottom} ${ipLeft}" fill="#0d0d0d" stroke="url(#goldGrad)" stroke-width="${size * 0.02}" />

    <!-- Center Gem Star -->
    <circle cx="${center}" cy="${center}" r="${size * 0.035}" fill="#FFF" />
  </svg>`;
}

async function generate() {
  const s192 = Buffer.from(createIconSvg(192, false));
  await sharp(s192).png().toFile(path.join(outDir, "icon-192.png"));
  console.log("Generated icon-192.png");

  const s512 = Buffer.from(createIconSvg(512, false));
  await sharp(s512).png().toFile(path.join(outDir, "icon-512.png"));
  console.log("Generated icon-512.png");

  const s512Maskable = Buffer.from(createIconSvg(512, true));
  await sharp(s512Maskable).png().toFile(path.join(outDir, "icon-512-maskable.png"));
  console.log("Generated icon-512-maskable.png");
}

generate().catch(console.error);
