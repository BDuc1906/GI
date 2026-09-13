import { describe, expect, it, vi } from "vitest";
import { SearchService } from "./service";

describe("SearchService", () => {
  it("aggregates character, weapon, artifact and domain results for a valid query", async () => {
    const repo = {
      searchCharacters: vi.fn().mockResolvedValue([{ id: "kazuha", name: "Kazuha" }]),
      searchWeapons: vi.fn().mockResolvedValue([{ id: "dull-blade", name: "Dull Blade" }]),
      searchArtifacts: vi.fn().mockResolvedValue([{ id: "viridescent-venerer", name: "Viridescent Venerer" }]),
      searchDomains: vi.fn().mockResolvedValue([{ id: "domain-of-endorsement", name: "Domain of Endorsement" }]),
    };

    const service = new SearchService(repo);
    const result = await service.search("kazuha", { limit: 12 });

    expect(repo.searchCharacters).toHaveBeenCalledWith("kazuha", 12);
    expect(result.query).toBe("kazuha");
    expect(result.total).toBe(4);
    expect(result.characters).toHaveLength(1);
    expect(result.weapons).toHaveLength(1);
    expect(result.artifacts).toHaveLength(1);
    expect(result.domains).toHaveLength(1);
  });

  it("throws when the query is empty after trim", async () => {
    const service = new SearchService({
      searchCharacters: vi.fn(),
      searchWeapons: vi.fn(),
      searchArtifacts: vi.fn(),
      searchDomains: vi.fn(),
    });

    await expect(service.search("   ")).rejects.toThrow("Query không được để trống");
  });
});
