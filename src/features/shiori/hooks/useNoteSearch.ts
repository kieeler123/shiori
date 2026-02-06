import { useMemo, useState } from "react";
import type { NoteItem, Suggestion } from "../type/logs";
import { buildSearchIndex, type IndexedNote } from "../utils/searchIndex";
import { loadRecentQueries, pushRecentQuery } from "../utils/recentSearch";

export type SearchScope = "all" | "title" | "content" | "tags";

function tokenize(q: string): string[] {
  return q.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function getHaystack(it: IndexedNote, scope: SearchScope): string {
  if (scope === "title") return it.__titleLower;
  if (scope === "content") return it.__bodyLower;
  if (scope === "tags") return it.__tagsTextLower;
  return it.__searchText; // all
}

function matchesQuery(it: IndexedNote, q: string, scope: SearchScope): boolean {
  const tokens = tokenize(q);
  if (!tokens.length) return true;

  const hay = getHaystack(it, scope);
  return tokens.every((t) => hay.includes(t));
}

function matchesTags(it: IndexedNote, selectedTags: string[]): boolean {
  if (!selectedTags.length) return true;
  const set = new Set(it.__tagsLower);
  return selectedTags.every((t) => set.has(t.toLowerCase()));
}

export function useNoteSearch(items: NoteItem[]) {
  const [query, setQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<
    "updated_desc" | "created_desc" | "created_asc"
  >("updated_desc");

  // ✅ 새 옵션: 검색 범위(scope)
  const [scope, setScope] = useState<SearchScope>("all");

  const [recentQueries, setRecentQueries] = useState<string[]>(() =>
    loadRecentQueries(),
  );

  const indexed = useMemo<IndexedNote[]>(
    () => buildSearchIndex(items),
    [items],
  );

  const visibleItems = useMemo<NoteItem[]>(() => {
    let list = indexed
      .filter((it) => matchesTags(it, selectedTags))
      .filter((it) => matchesQuery(it, query, scope));

    const arr = [...list];
    if (sortKey === "updated_desc")
      arr.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    if (sortKey === "created_desc")
      arr.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    if (sortKey === "created_asc")
      arr.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));

    return arr;
  }, [indexed, selectedTags, query, scope, sortKey]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = query.trim().toLowerCase();

    const recent = recentQueries
      .filter((v) => (q ? v.toLowerCase().includes(q) : true))
      .slice(0, 6)
      .map((v) => ({ type: "recent" as const, value: v }));

    if (!q) return recent;

    const tagSet = new Set<string>();
    const titleSet = new Set<string>();

    for (const it of items) {
      (it.tags ?? []).forEach((t) => tagSet.add(t));
      if (it.title) titleSet.add(it.title);
    }

    const tags = [...tagSet]
      .filter((v) => v.toLowerCase().includes(q))
      .slice(0, 6)
      .map((v) => ({ type: "tag" as const, value: v }));

    const titles = [...titleSet]
      .filter((v) => v.toLowerCase().includes(q))
      .slice(0, 6)
      .map((v) => ({ type: "title" as const, value: v }));

    return [...recent, ...tags, ...titles].slice(0, 10);
  }, [query, recentQueries, items]);

  function commitSearch(q: string) {
    const next = pushRecentQuery(q);
    setRecentQueries(next);
  }

  function pickSuggestion(s: Suggestion) {
    if (s.type === "tag") {
      setSelectedTags((prev) =>
        prev.includes(s.value) ? prev : [...prev, s.value],
      );
      return;
    }
    setQuery(s.value);
    commitSearch(s.value);
  }

  return {
    // query
    query,
    setQuery,

    // ✅ 검색 전 옵션(범위)
    scope,
    setScope,

    // filters
    selectedTags,
    setSelectedTags,
    sortKey,
    setSortKey,

    // results
    visibleItems,
    suggestions,

    // actions
    commitSearch,
    pickSuggestion,
  };
}
