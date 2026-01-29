// features/shiori/utils/tagRank.ts
export type TagRankItem = { tag: string; score: number; count: number };

type LogLike = { tags: string[] };

/**
 * v0: 지금은 단순(가나다/알파벳) 정렬만.
 * 운영 단계에서:
 * - count 기반
 * - tag usage(클릭/검색) 기반
 * - 혼합 점수 기반
 * 으로 교체 예정.
 */
export function rankTags(items: LogLike[]): TagRankItem[] {
  const map = new Map<string, number>();

  for (const it of items) {
    for (const t of it.tags ?? []) {
      const key = String(t);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count, score: count }))
    .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag));
}
