import { describe, expect, it } from "vitest";
import {
  categorizeArtifactSet,
  ARTIFACT_CATEGORIES,
} from "@/core/game/artifact-filter-categories";

describe("categorizeArtifactSet — Phân loại bộ Thánh Di Vật theo cơ chế hiệu ứng", () => {
  it("nhận diện đúng bộ Tấn Công (ATK%) từ bonus 2 mảnh hoặc 4 mảnh", () => {
    const cats = categorizeArtifactSet("Tấn công tăng 18%", "Khi kích hoạt...", "Lễ Bế Mạc Của Đấu Sĩ");
    expect(cats).toContain("atk");
  });

  it("nhận diện đúng bộ Nạp Năng Lượng (Energy Recharge) — Dấu Ấn Khắc Sâu", () => {
    const cats = categorizeArtifactSet(
      "Hiệu Quả Nạp Năng Lượng tăng 20%",
      "Tăng sát thương Kỹ Năng Nộ dựa trên 25% Hiệu Quả Nạp Năng Lượng...",
      "Dấu Ấn Khắc Sâu"
    );
    expect(cats).toContain("er");
    expect(cats).toContain("skill_burst");
  });

  it("nhận diện đúng bộ Kỹ Năng Nguyên Tố — Đoàn Kịch Hoàng Kim", () => {
    const cats = categorizeArtifactSet(
      "Sát thương Kỹ Năng Nguyên Tố tăng 20%",
      "Sát thương Kỹ Năng Nguyên Tố tăng 25%. Ngoài ra khi không đứng sân...",
      "Đoàn Kịch Hoàng Kim"
    );
    expect(cats).toContain("skill_burst");
  });

  it("nhận diện đúng bộ Hồi Máu (Healing) — Xà Cừ Đại Dương", () => {
    const cats = categorizeArtifactSet(
      "Tăng 15% lượng trị liệu",
      "Khi nhân vật trang bị hồi máu cho thành viên trong đội...",
      "Xà Cừ Đại Dương"
    );
    expect(cats).toContain("healing");
  });

  it("nhận diện đúng bộ Tinh Thông (EM) — Giấc Mộng Hoàng Kim", () => {
    const cats = categorizeArtifactSet(
      "Tăng 80 điểm Tinh Thông Nguyên Tố",
      "Kích hoạt phản ứng nguyên tố sẽ...",
      "Giấc Mộng Hoàng Kim"
    );
    expect(cats).toContain("em");
  });

  it("ARTIFACT_CATEGORIES định nghĩa đủ các nhóm chỉ số chính", () => {
    expect(ARTIFACT_CATEGORIES.length).toBeGreaterThanOrEqual(10);
    const keys = ARTIFACT_CATEGORIES.map((c) => c.key);
    expect(keys).toContain("all");
    expect(keys).toContain("atk");
    expect(keys).toContain("crit");
    expect(keys).toContain("er");
    expect(keys).toContain("em");
    expect(keys).toContain("elemental");
    expect(keys).toContain("hp");
    expect(keys).toContain("def");
  });
});
