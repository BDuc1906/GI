import { describe, it, expect } from "vitest";
import {
  analyzeTeamEr,
  buildTeamRotation,
  CHARACTER_ENERGY_PROFILES,
} from "@/core/game/team-rotation";

describe("Team Rotation and ER Advisor", () => {
  const fallbackProfiles = {
    xiangling: { name: "Xiangling", element: "Pyro" },
    bennett: { name: "Bennett", element: "Pyro" },
    xingqiu: { name: "Xingqiu", element: "Hydro" },
    kazuha: { name: "Kaedehara Kazuha", element: "Anemo" },
  };

  it("should calculate lower ER requirement for Xiangling with Bennett (battery synergy)", () => {
    // Solo Xiangling
    const solo = analyzeTeamEr(["xiangling"], fallbackProfiles);
    expect(solo[0].recommendedEr).toBe(CHARACTER_ENERGY_PROFILES.xiangling.baseErTarget); // 240%

    // Xiangling + Bennett
    const withBennett = analyzeTeamEr(["xiangling", "bennett"], fallbackProfiles);
    const xl = withBennett.find((c) => c.id === "xiangling");
    expect(xl?.recommendedEr).toBe(CHARACTER_ENERGY_PROFILES.xiangling.batterySynergyEr); // 190%
    expect(xl?.isBatteryAvailable).toBe(true);
  });

  it("should drastically reduce team ER when Raiden Shogun is present", () => {
    const teamWithRaiden = analyzeTeamEr(["xiangling", "raiden"], {
      ...fallbackProfiles,
      raiden: { name: "Raiden Shogun", element: "Electro" },
    });
    const xl = teamWithRaiden.find((c) => c.id === "xiangling");
    expect(xl?.recommendedEr).toBe(CHARACTER_ENERGY_PROFILES.xiangling.favoniusOrRaidenEr); // 160%
  });

  it("should build a logical 5-phase rotation sequence for standard national team", () => {
    const team = ["bennett", "kazuha", "xingqiu", "xiangling"];
    const steps = buildTeamRotation(team, fallbackProfiles);

    expect(steps.length).toBeGreaterThanOrEqual(4);
    // Buff step should exist
    expect(steps.some((s) => s.phase === "buff")).toBe(true);
    // Sub-dps step should exist
    expect(steps.some((s) => s.phase === "sub_dps" || s.phase === "main_dps")).toBe(true);
    // Battery step at the end
    expect(steps[steps.length - 1].phase).toBe("battery");
  });
});
