import type { LogItem } from "../types";

const KEY = "shiori.logs";

export function loadLogs(): any[] {
  try {
    const raw = localStorage.getItem("shiori.logs");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr.map((x) => ({
          ...x,
          commentCount: Number(x?.commentCount ?? 0),
          userId: x?.userId ?? null,
          updatedAt: x?.updatedAt ?? null,
        }))
      : [];
  } catch {
    return [];
  }
}

export function saveLogs(items: LogItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}
