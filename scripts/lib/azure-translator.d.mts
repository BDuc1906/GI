// scripts/lib/azure-translator.d.mts
// Type declaration cho azure-translator.mjs để TypeScript import được
// mà không cần allowJs + checkJs toàn repo.

export const AZURE_LANG_CODE: Record<string, string>;

export function protectPlaceholders(text: string): {
  protectedText: string;
  restore: (translated: string) => string;
};

export function translateBatch(
  texts: string[],
  targetLang: string,
  sourceLang: string,
  apiKey: string | undefined,
  region: string | undefined
): Promise<string[]>;

export function translateStrings(
  texts: string[],
  targetLang: string,
  sourceLang: string,
  apiKey: string | undefined,
  region: string | undefined
): Promise<string[]>;