import { useCallback, useState } from "react";

type Reason = "initial" | "refresh";

type PageResult<Row> = {
  rows: Row[];
};

export const PAGE_SIZE = 10;

type FetchPage<Row> = (args: {
  limit: number;
  offset: number;
}) => Promise<PageResult<Row> | Row[]>;
// 너는 dbListPage가 Row[]를 리턴하니까 둘 다 지원

export function usePagedList<Row, Item>(opts: {
  pageSize: number;
  fetchPage: FetchPage<Row>;
  mapRow: (r: Row) => Item;
  filterItem?: (it: Item) => boolean; // true면 keep
  mergeKey?: (it: Item) => string; // 중복 제거 key (기본: (it as any).id)
  onCacheSave?: (items: Item[]) => void; // 필요할 때만
}) {
  const { pageSize, fetchPage, mapRow, filterItem, mergeKey, onCacheSave } =
    opts;

  const keyOf = useCallback(
    (it: Item) => (mergeKey ? mergeKey(it) : String((it as any)?.id)),
    [mergeKey],
  );

  const [items, setItems] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyMore, setBusyMore] = useState(false);

  const applyFilter = useCallback(
    (arr: Item[]) => (filterItem ? arr.filter(filterItem) : arr),
    [filterItem],
  );

  const loadFirstPage = useCallback(
    async (reason: Reason = "refresh") => {
      if (reason === "initial") setInitialLoading(true);
      else setRefreshing(true);

      try {
        const res = await fetchPage({ limit: pageSize, offset: 0 });
        const rows = Array.isArray(res) ? res : res.rows;

        const next = applyFilter(rows.map(mapRow));

        setItems(next);
        setOffset(rows.length);
        setHasMore(rows.length >= pageSize);

        onCacheSave?.(next);
      } finally {
        if (reason === "initial") setInitialLoading(false);
        else setRefreshing(false);
      }
    },
    [fetchPage, pageSize, mapRow, applyFilter, onCacheSave],
  );

  const loadNextPage = useCallback(async () => {
    if (busyMore) return;
    if (!hasMore) return;

    setBusyMore(true);
    try {
      const res = await fetchPage({ limit: pageSize, offset });
      const rows = Array.isArray(res) ? res : res.rows;

      const next = applyFilter(rows.map(mapRow));

      setItems((prev) => {
        const seen = new Set(prev.map(keyOf));
        const merged = [...prev];
        for (const it of next) {
          const k = keyOf(it);
          if (!seen.has(k)) merged.push(it);
        }
        onCacheSave?.(merged);
        return merged;
      });

      setOffset((v) => v + rows.length);
      if (rows.length < pageSize) setHasMore(false);
    } finally {
      setBusyMore(false);
    }
  }, [
    busyMore,
    hasMore,
    fetchPage,
    pageSize,
    offset,
    mapRow,
    applyFilter,
    keyOf,
    onCacheSave,
  ]);

  const resetPaging = useCallback(() => {
    setOffset(0);
    setHasMore(true);
  }, []);

  return {
    items,
    setItems, // 캐시 먼저 보여주는 패턴이 있으면 필요
    offset,
    hasMore,
    initialLoading,
    refreshing,
    busyMore,
    loadFirstPage,
    loadNextPage,
    resetPaging,
  };
}
