export type LocaleKey = "ko" | "ja" | "en" | "zh";

export function toIntlLocale(locale: LocaleKey) {
  // zh는 보통 zh-CN(간체)로 잡아두면 무난
  if (locale === "zh") return "zh-CN";
  return locale; // ko, ja, en
}

export function formatDateTime(value: string | Date, locale: string) {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatRelativeTime(value: string | Date, locale: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60)
    return new Intl.RelativeTimeFormat(locale).format(-minutes, "minute");

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return new Intl.RelativeTimeFormat(locale).format(-hours, "hour");

  const days = Math.floor(hours / 24);
  return new Intl.RelativeTimeFormat(locale).format(-days, "day");
}
