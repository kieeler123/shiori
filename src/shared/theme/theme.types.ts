export type ThemeName =
  | "pureDark"
  | "darkGray"
  | "navy"
  | "brownArchive"
  | "custom";

/** CSS 변수 토큰 묶음 */
export type ThemeTokens = Record<`--${string}`, string>;

export type ThemePreset = {
  name: Exclude<ThemeName, "custom">; // preset은 custom 제외
  label: string; // UI에 표시할 이름
  tokens: ThemeTokens;
};
