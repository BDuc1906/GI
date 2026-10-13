import { describe, expect, it } from "vitest";
import {
  classifyMaterial,
  MATERIAL_CATEGORIES,
} from "@/core/game/material-categories";

describe("classifyMaterial — Phân loại nguyên liệu tự động", () => {
  it("nhận diện đúng Sách Thiên Phú", () => {
    expect(classifyMaterial("guide-to-prosperity", "Guide to Prosperity")).toBe("talent_book");
    expect(classifyMaterial("triet-hoc-ve-cong-bang", "Triết Học Về Công Bằng")).toBe("talent_book");
    expect(classifyMaterial("teachings-of-ballad", "Teachings of Ballad")).toBe("talent_book");
  });

  it("nhận diện đúng Đá Đột Phá Nguyên Tố (Gemstone)", () => {
    expect(classifyMaterial("agnidus-agate-chunk", "Agnidus Agate Chunk")).toBe("gemstone");
    expect(classifyMaterial("varunada-lazurite-gemstone", "Varunada Lazurite Gemstone")).toBe("gemstone");
    expect(classifyMaterial("vun-ngoc-bang", "Vụn Ngọc Băng")).toBe("gemstone");
  });

  it("nhận diện đúng Nguyên Liệu Boss Tuần", () => {
    expect(classifyMaterial("dvalins-plume", "Dvalin's Plume")).toBe("weekly_boss");
    expect(classifyMaterial("ring-of-boreas", "Ring of Boreas")).toBe("weekly_boss");
    expect(classifyMaterial("molten-moment", "Molten Moment")).toBe("weekly_boss");
    expect(classifyMaterial("puppet-strings", "Puppet Strings")).toBe("weekly_boss");
  });

  it("nhận diện đúng Nguyên Liệu Đột Phá Vũ Khí", () => {
    expect(classifyMaterial("tile-of-decarabians-tower", "Tile of Decarabian's Tower")).toBe("weapon_mat");
    expect(classifyMaterial("boreal-wolfs-milk-tooth", "Boreal Wolf's Milk Tooth")).toBe("weapon_mat");
    expect(classifyMaterial("mask-of-the-wicked-lieutenant", "Mask of the Wicked Lieutenant")).toBe("weapon_mat");
  });

  it("nhận diện đúng Đặc Sản Địa Phương", () => {
    expect(classifyMaterial("dandelion-seed", "Dandelion Seed")).toBe("local_specialty");
    expect(classifyMaterial("cor-lapis", "Cor Lapis")).toBe("local_specialty");
    expect(classifyMaterial("naku-weed", "Naku Weed")).toBe("local_specialty");
    expect(classifyMaterial("lumidouce-bell", "Lumidouce Bell")).toBe("local_specialty");
  });

  it("nhận diện đúng Rơi Từ Quái Thường", () => {
    expect(classifyMaterial("slime-condensate", "Slime Condensate")).toBe("common_drop");
    expect(classifyMaterial("damaged-mask", "Damaged Mask")).toBe("common_drop");
    expect(classifyMaterial("kageuchi-handguard", "Kageuchi Handguard")).toBe("common_drop");
  });

  it("MATERIAL_CATEGORIES chứa đầy đủ 8 danh mục", () => {
    expect(MATERIAL_CATEGORIES).toHaveLength(8);
  });
});
