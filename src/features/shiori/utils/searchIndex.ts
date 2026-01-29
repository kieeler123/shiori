import type { NoteItem } from "../types";

export interface IndexedNote extends NoteItem {
  __searchText: string; // 전체(all) 검색용
  __titleLower: string; // title scope
  __bodyLower: string; // content scope
  __tagsTextLower: string; // tags scope (문자열)
  __tagsLower: string[]; // 태그 필터용(Set)
}

export function buildSearchIndex(items: NoteItem[]): IndexedNote[] {
  return items.map((it) => {
    const title = String(it.title ?? "").toLowerCase();
    const body = String(it.body ?? "").toLowerCase();
    const tags = Array.isArray(it.tags) ? it.tags : [];
    const tagsLower = tags.map((t) => String(t).toLowerCase());
    const tagsText = tagsLower.join(" ");

    return {
      ...it,
      __titleLower: title,
      __bodyLower: body,
      __tagsTextLower: tagsText,
      __searchText: `${title} ${body} ${tagsText}`.trim(),
      __tagsLower: tagsLower,
    };
  });
}
