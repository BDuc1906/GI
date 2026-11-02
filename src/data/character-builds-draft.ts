import type { CharacterBuildEntry } from "./character-builds-data";

/**
 * Bản nháp các build nhân vật đang trong quá trình đối soát dữ liệu
 * trước khi chuyển chính thức vào CHARACTER_BUILDS.
 */
export const DRAFT_BUILDS: Record<string, CharacterBuildEntry> = {};
