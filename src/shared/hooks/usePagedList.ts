import { useCallback, useEffect, useRef, useState } from "react";

type Reason = "initial" | "refresh";

type PageResult<Row> = {
  rows: Row[];
};

export const PAGE_SIZE = 10;

type FetchPage<Row> = (args: {
  limit: number;
  offset: number;
}) => Promise<PageResult<Row> | Row[]>;

export function usePagedList<Row, Item>(opts: {
  pageSize: number;
  fetchPage: FetchPage<Row>;
  mapRow: (r: Row) => Item;
  filterItem?: (it: Item) => boolean;
  mergeKey?: (it: Item) => string;
  onCacheSave?: (items: Item[]) => void;
  key: string;
}) {
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const requestIdRef = useRef(0);

  const [items, setItems] = useState<Item[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyMore, setBusyMore] = useState(false);

  const normalizeRows = (res: PageResult<Row> | Row[]) => {
    return Array.isArray(res) ? res : res.rows;
  };

  const applyFilter = useCallback((arr: Item[]) => {
    const { filterItem } = optsRef.current;
    return filterItem ? arr.filter(filterItem) : arr;
  }, []);

  const keyOf = useCallback((it: Item) => {
    const { mergeKey } = optsRef.current;
    return mergeKey ? mergeKey(it) : String((it as any)?.id);
  }, []);

  const loadFirstPage = useCallback(
    async (reason: Reason = "refresh") => {
      const requestId = ++requestIdRef.current;

      const { pageSize, fetchPage, mapRow, onCacheSave } = optsRef.current;

      if (reason === "initial") setInitialLoading(true);
      else setRefreshing(true);

      try {
        const res = await fetchPage({ limit: pageSize, offset: 0 });

        if (requestId !== requestIdRef.current) return;

        const rows = normalizeRows(res);
        const next = applyFilter(rows.map(mapRow));

        setItems(next);
        setOffset(rows.length);
        setHasMore(rows.length >= pageSize);

        onCacheSave?.(next);
      } finally {
        if (requestId === requestIdRef.current) {
          if (reason === "initial") setInitialLoading(false);
          else setRefreshing(false);
        }
      }
    },
    [applyFilter],
  );

  const loadNextPage = useCallback(async () => {
    if (busyMore || !hasMore) return;

    const { pageSize, fetchPage, mapRow, onCacheSave } = optsRef.current;
    const currentOffset = offset;

    setBusyMore(true);

    try {
      const res = await fetchPage({
        limit: pageSize,
        offset: currentOffset,
      });

      const rows = normalizeRows(res);
      const next = applyFilter(rows.map(mapRow));

      setItems((prev) => {
        const seen = new Set(prev.map(keyOf));
        const merged = [...prev];

        for (const it of next) {
          const k = keyOf(it);
          if (!seen.has(k)) {
            seen.add(k);
            merged.push(it);
          }
        }

        onCacheSave?.(merged);
        return merged;
      });

      setOffset((prev) => prev + rows.length);
      setHasMore(rows.length >= pageSize);
    } finally {
      setBusyMore(false);
    }
  }, [busyMore, hasMore, offset, applyFilter, keyOf]);

  const resetPaging = useCallback(() => {
    requestIdRef.current += 1;
    setItems([]);
    setOffset(0);
    setHasMore(true);
    setInitialLoading(true);
    setRefreshing(false);
    setBusyMore(false);
  }, []);

  useEffect(() => {
    resetPaging();
    loadFirstPage("initial");
  }, [opts.key]);

  return {
    items,
    setItems,
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
