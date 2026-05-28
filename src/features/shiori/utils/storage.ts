import type { LogItem } from "../type/logs";

const KEY = "shiori.logs";

export function loadLogs(): LogItem[] {
  return [];
}

export function saveLogs(_items: LogItem[]) {}

export function clearLogsCache() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
