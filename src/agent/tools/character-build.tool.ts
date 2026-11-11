// src/agent/tools/character-build.tool.ts
/**
 * Character Build Tool - Tra cứu build chuẩn của nhân vật
 * từ cơ sở dữ liệu curated builds (vũ khí xếp hạng, bộ thánh tích, chỉ số chính/phụ, đội hình).
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { getCharacterBuild, getBuildSource } from "@/data/character-builds-data";
import { prisma } from "@/lib/db/prisma";

const CharacterBuildParams = z.object({
  characterId: z
    .string()
    .describe("ID hoặc tên slug của nhân vật (ví dụ: hutao, raiden, furina, neuvillette, kazuha)"),
});
type CharacterBuildParams = z.infer<typeof CharacterBuildParams>;

export interface CharacterBuildOutput {
  characterId: string;
  characterName: string;
  source: string;
  hasCuratedBuild: boolean;
  recommendedWeapons: Array<{
    id: string;
    tier: string;
    noteVi?: string;
  }>;
  recommendedArtifacts: Array<{
    sets: string[];
    mode: string;
    priority: number;
    noteVi?: string;
  }>;
  mainStats: {
    sands: string;
    goblet: string;
    circlet: string;
    note?: string;
  };
  subStats: {
    stats: string[];
    note?: string;
  };
  talentPriority: {
    order: string[];
    note?: string;
  };
  playstyleNoteVi?: string;
  recommendedTeams: Array<{
    name: string;
    archetype: string;
    teammates: string[];
    reactions: string[];
  }>;
}

export class CharacterBuildTool extends BaseTool<CharacterBuildParams, CharacterBuildOutput> {
  name = "getCharacterBuildGuide";
  description =
    "Tra cứu hướng dẫn build chuẩn chuyên gia của nhân vật: xếp hạng vũ khí tối ưu, bộ thánh tích khuyên dùng, main stat (cát/chén/nón), thứ tự ưu tiên dòng phụ và đội hình tiêu biểu.";
  permission = "public" as const;
  parameters = CharacterBuildParams;

  protected async run(params: CharacterBuildParams, _context: ToolContext): Promise<CharacterBuildOutput> {
    const { characterId } = params;

    const char = await prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, name: true },
    });

    const build = getCharacterBuild(characterId);
    const source = getBuildSource(characterId);

    if (!build) {
      return {
        characterId,
        characterName: char?.name || characterId,
        source: "not_found",
        hasCuratedBuild: false,
        recommendedWeapons: [],
        recommendedArtifacts: [],
        mainStats: { sands: "", goblet: "", circlet: "" },
        subStats: { stats: [] },
        talentPriority: { order: [] },
        recommendedTeams: [],
      };
    }

    return {
      characterId,
      characterName: char?.name || characterId,
      source,
      hasCuratedBuild: true,
      recommendedWeapons: (build.weapons || []).map((w) => ({
        id: w.weaponId,
        tier: w.tier,
        noteVi: w.noteVi,
      })),
      recommendedArtifacts: (build.artifacts || []).map((a) => ({
        sets: a.setIds,
        mode: a.mode,
        priority: a.priority,
        noteVi: a.noteVi,
      })),
      mainStats: {
        sands: build.mainStats?.sands || "",
        goblet: build.mainStats?.goblet || "",
        circlet: build.mainStats?.circlet || "",
        note: build.mainStats?.note,
      },
      subStats: {
        stats: build.subStats?.stats || [],
        note: build.subStats?.note,
      },
      talentPriority: {
        order: build.talentPriority?.order ? Array.from(build.talentPriority.order) : [],
        note: build.talentPriority?.note,
      },
      playstyleNoteVi: build.playstyleNoteVi,
      recommendedTeams: (build.teams || []).map((t) => ({
        name: t.nameVi,
        archetype: t.archetypeVi,
        teammates: Array.from(t.teammateIds),
        reactions: t.reactionsVi,
      })),
    };
  }
}
