import type { LogItem } from "../types";

const KEY = "shiori.logs.v1";

export function loadLogs(): LogItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    // 최소한의 런타임 검증(깨진 데이터 방어)
    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        id: String(x.id ?? crypto.randomUUID()),
        title: String(x.title ?? ""),
        content: String(x.content ?? ""),
        tags: Array.isArray(x.tags) ? x.tags.map(String) : [],
        createdAt: String(x.createdAt ?? new Date().toISOString()),
      }));
  } catch {
    return [];
  }
}

export function saveLogs(logs: LogItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(logs));
  } catch {
    // 저장공간 부족/사파리 프라이빗 모드 등에서 실패 가능
  }
}
