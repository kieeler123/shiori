import type { LogItem } from "../type/logs";

const KEY = "shiori.logs";

export function loadLogs(): LogItem[] {
  // 현재는 stale cache 문제 방지를 위해 캐시 읽기 비활성화
  return [];
}

export function saveLogs(_items: LogItem[]) {
  // 현재는 stale cache 문제 방지를 위해 캐시 저장 비활성화
}

export function clearLogsCache() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
