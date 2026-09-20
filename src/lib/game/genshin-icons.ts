/**
 * Genshin Impact Game Icons Helper
 * Lấy icon thật từ database (sử dụng cả iconUrl và iconUrlOriginal)
 * CHỈ DÙNG TRÊN SERVER-SIDE (API routes)
 */

import { prisma } from '@/lib/db/prisma';

// Map category sang icon từ database (ưu tiên iconUrlOriginal, fallback iconUrl)
export async function getGameIcon(category: string): Promise<string> {
  try {
    switch (category) {
      case 'characters':
      case 'nhân vật':
        // Lấy icon của nhân vật đầu tiên
        const character = await prisma.character.findFirst({
          where: { 
            OR: [
              { iconUrlOriginal: { not: null } },
              { iconUrl: { not: null } }
            ]
          },
          select: { iconUrlOriginal: true, iconUrl: true }
        });
        return character?.iconUrlOriginal || character?.iconUrl || '';
      
      case 'weapons':
      case 'vũ khí':
        // Lấy icon của vũ khí đầu tiên
        const weapon = await prisma.weapon.findFirst({
          where: { 
            OR: [
              { iconUrlOriginal: { not: null } },
              { iconUrl: { not: null } }
            ]
          },
          select: { iconUrlOriginal: true, iconUrl: true }
        });
        return weapon?.iconUrlOriginal || weapon?.iconUrl || '';
      
      case 'artifacts':
      case 'thánh di vật':
        // Lấy icon của artifact set đầu tiên
        const artifact = await prisma.artifactSet.findFirst({
          where: { 
            OR: [
              { iconUrlOriginal: { not: null } },
              { iconUrl: { not: null } }
            ]
          },
          select: { iconUrlOriginal: true, iconUrl: true }
        });
        return artifact?.iconUrlOriginal || artifact?.iconUrl || '';
      
      case 'materials':
      case 'nguyên liệu':
        // Lấy icon của nguyên liệu đầu tiên
        const material = await prisma.material.findFirst({
          where: { 
            OR: [
              { iconUrlOriginal: { not: null } },
              { iconUrl: { not: null } }
            ]
          },
          select: { iconUrlOriginal: true, iconUrl: true }
        });
        return material?.iconUrlOriginal || material?.iconUrl || '';
      
      case 'domains':
      case 'bí cảnh':
        // Domain không có icon, trả về empty string
        return '';
      
      case 'enemies':
      case 'kẻ địch':
        // Enemies không có icon, trả về empty string
        return '';
      
      default:
        return '';
    }
  } catch (error) {
    console.error(`Error getting game icon for ${category}:`, error);
    return '';
  }
}

// Lấy icon tool từ database
export async function getToolIcon(tool: string): Promise<string> {
  try {
    switch (tool) {
      case 'calendar':
      case 'lịch':
        // Sử dụng icon của Condensed Resin hoặc Resin
        const resin = await prisma.material.findFirst({
          where: { 
            name: { contains: 'Resin' },
            OR: [
              { iconUrlOriginal: { not: null } },
              { iconUrl: { not: null } }
            ]
          },
          select: { iconUrlOriginal: true, iconUrl: true }
        });
        return resin?.iconUrlOriginal || resin?.iconUrl || '';
      
      case 'tierlist':
      case 'bảng xếp hạng':
        // Sử dụng icon của Primogem
        const primogem = await prisma.material.findFirst({
          where: { 
            name: { contains: 'Primogem' },
            OR: [
              { iconUrlOriginal: { not: null } },
              { iconUrl: { not: null } }
            ]
          },
          select: { iconUrlOriginal: true, iconUrl: true }
        });
        return primogem?.iconUrlOriginal || primogem?.iconUrl || '';
      
      case 'calculator':
      case 'máy tính':
        // Sử dụng icon của Mora
        const mora = await prisma.material.findFirst({
          where: { 
            name: { contains: 'Mora' },
            OR: [
              { iconUrlOriginal: { not: null } },
              { iconUrl: { not: null } }
            ]
          },
          select: { iconUrlOriginal: true, iconUrl: true }
        });
        return mora?.iconUrlOriginal || mora?.iconUrl || '';
      
      case 'optimizer':
      case 'tối ưu':
        // Sử dụng icon của artifact set
        const artifact = await prisma.artifactSet.findFirst({
          where: { 
            OR: [
              { iconUrlOriginal: { not: null } },
              { iconUrl: { not: null } }
            ]
          },
          select: { iconUrlOriginal: true, iconUrl: true }
        });
        return artifact?.iconUrlOriginal || artifact?.iconUrl || '';
      
      default:
        return '';
    }
  } catch (error) {
    console.error(`Error getting tool icon for ${tool}:`, error);
    return '';
  }
}

// Lấy ảnh Spiral Abyss (La Hoàn Thâm Cảnh)
export async function getSpiralAbyssImage(): Promise<string> {
  try {
    // Sử dụng icon của artifact set
    const artifact = await prisma.artifactSet.findFirst({
      where: { 
        OR: [
          { iconUrlOriginal: { not: null } },
          { iconUrl: { not: null } }
        ]
      },
      select: { iconUrlOriginal: true, iconUrl: true }
    });
    return artifact?.iconUrlOriginal || artifact?.iconUrl || '';
  } catch (error) {
    console.error('Error getting Spiral Abyss image:', error);
    return '';
  }
}