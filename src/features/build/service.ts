import { prisma } from "@/lib/db/prisma";
import { getCharacterBuild } from "@/data/character-builds-data";
import type { BuildRecommendation, BuildRecommendationRequest } from "./types";

/**
 * BuildService - Dịch vụ gợi ý vũ khí cho nhân vật.
 *
 * TUÂN THỦ NGUYÊN TẮC:
 * - 100% sử dụng dữ liệu vũ khí được biên tập và kiểm định từ KQM / Meta Curated Build.
 * - TUYỆT ĐỐI KHÔNG chọn vũ khí theo bảng chữ cái A-Z hoặc cùng độ hiếm.
 * - Khi chưa có dữ liệu kiểm định, thông báo rõ ràng, không tự bịa đề xuất.
 */
export class BuildService {
  async recommend(input: BuildRecommendationRequest): Promise<BuildRecommendation> {
    const character = await prisma.character.findUnique({
      where: { id: input.characterId },
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
      },
    });

    if (!character) {
      throw new Error(`Không tìm thấy nhân vật với id: ${input.characterId}`);
    }

    const curated = getCharacterBuild(character.id);

    // 1. Nếu người dùng chỉ định cụ thể 1 weaponId
    if (input.weaponId) {
      const weapon = await prisma.weapon.findUnique({
        where: { id: input.weaponId },
        select: {
          id: true,
          name: true,
          type: true,
          rarity: true,
        },
      });

      if (!weapon) {
        throw new Error(`Không tìm thấy vũ khí với id: ${input.weaponId}`);
      }

      // Kiểm tra tính tương thích loại vũ khí
      if (character.weaponType && weapon.type && character.weaponType !== weapon.type) {
        throw new Error(
          `Vũ khí ${weapon.name} (${weapon.type}) không tương thích với loại vũ khí của ${character.name} (${character.weaponType})`
        );
      }

      const matchingCurated = curated?.weapons?.find((w) => w.weaponId === weapon.id);
      const note = matchingCurated?.noteVi || `Vũ khí phù hợp cho ${character.name}`;

      return {
        characterId: character.id,
        characterName: character.name,
        vision: character.vision,
        weaponType: character.weaponType,
        recommendedWeapon: weapon,
        summary: `Vũ khí được chọn cho ${character.name}: ${weapon.name} (${matchingCurated ? `Tier ${matchingCurated.tier} - ${note}` : note}).`,
      };
    }

    // 2. Tự động đề xuất: Lấy vũ khí Tier S #1 từ Curated Meta Build
    if (curated && curated.weapons && curated.weapons.length > 0) {
      const topCuratedWeapon = curated.weapons[0];
      const weapon = await prisma.weapon.findUnique({
        where: { id: topCuratedWeapon.weaponId },
        select: {
          id: true,
          name: true,
          type: true,
          rarity: true,
        },
      });

      if (weapon) {
        const playstyle = curated.playstyleNoteVi ? ` - Lối chơi: ${curated.playstyleNoteVi}` : "";
        const summary = `Build vũ khí chuẩn cho ${character.name}: Khuyên dùng ${weapon.name} (Tier ${topCuratedWeapon.tier}) - ${topCuratedWeapon.noteVi}.${playstyle}`;

        return {
          characterId: character.id,
          characterName: character.name,
          vision: character.vision,
          weaponType: character.weaponType,
          recommendedWeapon: weapon,
          summary,
        };
      }
    }

    // 3. Nếu chưa có build kiểm định -> Không tự bịa theo alphabet hay độ hiếm!
    return {
      characterId: character.id,
      characterName: character.name,
      vision: character.vision,
      weaponType: character.weaponType,
      recommendedWeapon: null,
      summary: `Hiện chưa có cấu hình vũ khí được xác minh cho ${character.name}. Hệ thống không tự tạo đề xuất thiếu căn cứ.`,
    };
  }
}
