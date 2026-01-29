const KEY = "shiori:recentQueries";
const MAX = 10;

export function loadRecentQueries(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function pushRecentQuery(q: string): string[] {
  const query = q.trim();
  if (!query) return loadRecentQueries();

  const prev = loadRecentQueries();
  const next = [query, ...prev.filter((x) => x !== query)].slice(0, MAX);

  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
