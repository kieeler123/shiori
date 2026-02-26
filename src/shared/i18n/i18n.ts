export type Locale = "ja" | "en" | "ko" | "zh";

import { ja } from "./locales/ja";
import { en } from "./locales/en";
import { ko } from "./locales/ko";
import { zh } from "./locales/zh";

export const MESSAGES = {
  ja,
  en,
  ko,
  zh,
} as const;

export type Messages = typeof ja;

export function getByPath(obj: any, path: string) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}
