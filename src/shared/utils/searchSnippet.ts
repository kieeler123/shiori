// src/features/shiori/utils/searchSnippet.ts
export function snippetAroundQuery(
  text: string,
  query: string,
  opts?: { radius?: number; maxLen?: number },
) {
  const q = query.trim().toLowerCase();
  const radius = opts?.radius ?? 60; // 매치 주변 앞뒤
  const maxLen = opts?.maxLen ?? 140;

  const raw = (text ?? "").replace(/\s+/g, " ").trim();
  if (!q) return raw.slice(0, maxLen);

  const idx = raw.toLowerCase().indexOf(q);
  if (idx < 0) return raw.slice(0, maxLen);

  const start = Math.max(0, idx - radius);
  const end = Math.min(raw.length, idx + q.length + radius);

  let snippet = raw.slice(start, end);
  if (start > 0) snippet = "… " + snippet;
  if (end < raw.length) snippet = snippet + " …";

  // 너무 길면 maxLen로 2차 컷
  if (snippet.length > maxLen) {
    snippet = snippet.slice(0, maxLen - 2) + "…";
  }
  return snippet;
}
