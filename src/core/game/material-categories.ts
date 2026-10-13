/**
 * src/core/game/material-categories.ts
 *
 * Hệ thống phân loại nguyên liệu Genshin Impact chuẩn game:
 * 1. Sách Thiên Phú (Talent Books)
 * 2. Đột Phá Vũ Khí (Weapon Materials)
 * 3. Đá Đột Phá Nhân Vật (Character Gemstones)
 * 4. Rơi Từ Boss Tuần (Weekly Boss Drops)
 * 5. Đặc Sản Địa Phương (Local Specialties)
 * 6. Rơi Từ Quái Thường (Common Enemy Drops)
 * 7. Vật Phẩm Khác & Rèn (Others / Ores)
 */

export type MaterialCategoryKey =
  | "all"
  | "talent_book"
  | "weapon_mat"
  | "gemstone"
  | "weekly_boss"
  | "local_specialty"
  | "common_drop"
  | "other";

export interface MaterialCategoryDef {
  key: MaterialCategoryKey;
  nameVi: string;
  descriptionVi: string;
}

export const MATERIAL_CATEGORIES: MaterialCategoryDef[] = [
  { key: "all", nameVi: "Tất cả", descriptionVi: "Toàn bộ kho nguyên liệu" },
  { key: "talent_book", nameVi: "Sách Thiên Phú", descriptionVi: "Bài Giảng, Hướng Dẫn, Triết Học nâng cấp kỹ năng" },
  { key: "weapon_mat", nameVi: "Đột Phá Vũ Khí", descriptionVi: "Nguyên liệu rơi từ Bí cảnh vũ khí" },
  { key: "gemstone", nameVi: "Đá Nguyên Tố", descriptionVi: "Đá đột phá nhân vật (Vụn, Mảnh, Cục, Đá Hoàn Chỉnh)" },
  { key: "weekly_boss", nameVi: "Nguyên Liệu Boss Tuần", descriptionVi: "Chiến lợi phẩm từ các Bí Cảnh Vùng (Trounce Domains)" },
  { key: "local_specialty", nameVi: "Đặc Sản Địa Phương", descriptionVi: "Cây cỏ, hoa quả, khoáng sản thu thập trên bản đồ" },
  { key: "common_drop", nameVi: "Rơi Từ Quái", descriptionVi: "Chiến lợi phẩm hạ gục quái thường và tinh anh" },
  { key: "other", nameVi: "Khác & Rèn", descriptionVi: "Khoáng thạch, Mora, EXP và vật phẩm tiêu hao" },
];

/**
 * Phân loại nguyên liệu tự động dựa trên tên và ID.
 */
export function classifyMaterial(id: string, name: string): MaterialCategoryKey {
  const lowerName = name.toLowerCase();
  const lowerId = id.toLowerCase();
  const combined = `${lowerId} ${lowerName}`;

  // 1. Sách Thiên Phú (Talent Books)
  if (
    combined.includes("teachings of") ||
    combined.includes("guide to") ||
    combined.includes("philosophies of") ||
    combined.includes("bài giảng") ||
    combined.includes("hướng dẫn") ||
    combined.includes("triết học") ||
    combined.includes("talent") ||
    combined.includes("thơ văn") ||
    combined.includes("chăm chỉ") ||
    combined.includes("hoàng kim") ||
    combined.includes("tự do") ||
    combined.includes("kháng cự") ||
    combined.includes("ánh sáng") ||
    combined.includes("phồn vinh") ||
    combined.includes("thanh liêm") ||
    combined.includes("công bằng") ||
    combined.includes("trật tự") ||
    combined.includes("ung dung")
  ) {
    return "talent_book";
  }

  // 2. Đá Đột Phá Nguyên Tố (Gemstones)
  if (
    combined.includes("agate") ||
    combined.includes("lazurite") ||
    combined.includes("emerald") ||
    combined.includes("amethyst") ||
    combined.includes("turquoise") ||
    combined.includes("jade") ||
    combined.includes("topaz") ||
    combined.includes("mã não") ||
    combined.includes("thanh kim") ||
    combined.includes("ngọc lam") ||
    combined.includes("tử tinh") ||
    combined.includes("vụ tinh") ||
    combined.includes("ngọc băng") ||
    combined.includes("hoàng ngọc") ||
    combined.includes("sliver") ||
    combined.includes("fragment") ||
    combined.includes("chunk") ||
    combined.includes("gemstone") ||
    combined.includes("brilliant diamond")
  ) {
    return "gemstone";
  }

  // 3. Nguyên Liệu Boss Tuần (Weekly Boss Drops)
  if (
    combined.includes("dvalin") ||
    combined.includes("boreas") ||
    combined.includes("childe") ||
    combined.includes("azhdaha") ||
    combined.includes("signora") ||
    combined.includes("raiden") ||
    combined.includes("scaramouche") ||
    combined.includes("apep") ||
    combined.includes("narwhal") ||
    combined.includes("plume") ||
    combined.includes("claw") ||
    combined.includes("sigh") ||
    combined.includes("ring of") ||
    combined.includes("spirit locket") ||
    combined.includes("tail of") ||
    combined.includes("shadow of the warrior") ||
    combined.includes("shard of a foul legacy") ||
    combined.includes("tusk of monodocer") ||
    combined.includes("bloodjade branch") ||
    combined.includes("dragon lord's crown") ||
    combined.includes("gilded scale") ||
    combined.includes("molten moment") ||
    combined.includes("hellfire butterfly") ||
    combined.includes("ashen heart") ||
    combined.includes("mudra of the malefic") ||
    combined.includes("tears of the calamitous") ||
    combined.includes("the meaning of aeons") ||
    combined.includes("daka's bell") ||
    combined.includes("mirror of mushin") ||
    combined.includes("puppet strings") ||
    combined.includes("worldspan fern") ||
    combined.includes("primordial greenbloom") ||
    combined.includes("everamber") ||
    combined.includes("lightless silk string") ||
    combined.includes("lightless eye of the maelstrom") ||
    combined.includes("lightless mass") ||
    combined.includes("silken feather") ||
    combined.includes("eroding horn")
  ) {
    return "weekly_boss";
  }

  // 4. Nguyên Liệu Đột Phá Vũ Khí (Weapon Materials)
  if (
    combined.includes("decarabian") ||
    combined.includes("boreal wolf") ||
    combined.includes("dandelion gladiator") ||
    combined.includes("guyun") ||
    combined.includes("mist veiled") ||
    combined.includes("aerosiderite") ||
    combined.includes("distant sea") ||
    combined.includes("narukami") ||
    combined.includes("mask of the") ||
    combined.includes("forest dew") ||
    combined.includes("oasis garden") ||
    combined.includes("scorching might") ||
    combined.includes("pure sacred dewdrop") ||
    combined.includes("ancient chord") ||
    combined.includes("pristine sea") ||
    combined.includes("delirious divinity") ||
    combined.includes("sacred lord") ||
    combined.includes("răng nanh") ||
    combined.includes("mặt nạ") ||
    combined.includes("thỏi cát") ||
    combined.includes("xiềng xích")
  ) {
    return "weapon_mat";
  }

  // 5. Đặc Sản Địa Phương (Local Specialties)
  if (
    combined.includes("dandelion seed") ||
    combined.includes("philanemo mushroom") ||
    combined.includes("valberry") ||
    combined.includes("small lamp grass") ||
    combined.includes("calla lily") ||
    combined.includes("cecilia") ||
    combined.includes("wolfhook") ||
    combined.includes("windwheel aster") ||
    combined.includes("cor lapis") ||
    combined.includes("glaze lily") ||
    combined.includes("silk flower") ||
    combined.includes("qingxin") ||
    combined.includes("noctilucous jade") ||
    combined.includes("starconch") ||
    combined.includes("jueyun chili") ||
    combined.includes("violetgrass") ||
    combined.includes("naku weed") ||
    combined.includes("sea ganoderma") ||
    combined.includes("sango pearl") ||
    combined.includes("dendrobium") ||
    combined.includes("crystal marrow") ||
    combined.includes("amakumo fruit") ||
    combined.includes("fluorescent fungus") ||
    combined.includes("onikabuto") ||
    combined.includes("kalpalata lotus") ||
    combined.includes("nilotpala lotus") ||
    combined.includes("rukkhashava mushrooms") ||
    combined.includes("padisarah") ||
    combined.includes("scarab") ||
    combined.includes("redcrest") ||
    combined.includes("sand grease pupa") ||
    combined.includes("mourning flower") ||
    combined.includes("beryl conch") ||
    combined.includes("romaritime flower") ||
    combined.includes("lumidouce bell") ||
    combined.includes("rainbow rose") ||
    combined.includes("subdetection unit") ||
    combined.includes("lakelight lily") ||
    combined.includes("spring of the first dewdrop") ||
    combined.includes("sprayfeather gill") ||
    combined.includes("saurian claw succulent") ||
    combined.includes("quenepa berry") ||
    combined.includes("withering purpurbloom")
  ) {
    return "local_specialty";
  }

  // 6. Rơi Từ Quái Thường (Common Enemy Drops)
  if (
    combined.includes("slime") ||
    combined.includes("mask") ||
    combined.includes("scroll") ||
    combined.includes("arrowhead") ||
    combined.includes("insignia") ||
    combined.includes("nectar") ||
    combined.includes("handguard") ||
    combined.includes("specter") ||
    combined.includes("spore") ||
    combined.includes("pollen") ||
    combined.includes("dust") ||
    combined.includes("fang") ||
    combined.includes("fin") ||
    combined.includes("gear") ||
    combined.includes("core") ||
    combined.includes("horn") ||
    combined.includes("bone") ||
    combined.includes("prism") ||
    combined.includes("statue") ||
    combined.includes("branch") ||
    combined.includes("shell") ||
    combined.includes("whistle") ||
    combined.includes("droplet") ||
    combined.includes("tinh dầu") ||
    combined.includes("mặt nạ") ||
    combined.includes("mật hoa") ||
    combined.includes("kiếm cách") ||
    combined.includes("bào tử") ||
    combined.includes("huy hiệu")
  ) {
    return "common_drop";
  }

  return "other";
}
