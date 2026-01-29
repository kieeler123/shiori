export type LogItem = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO
};

export interface NoteItem {
  id: string;
  title: string;
  body?: string; // content 쓰면 그걸로 바꿔도 됨
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export type SuggestionType = "recent" | "tag" | "title" | "keyword";

export interface Suggestion {
  type: SuggestionType;
  value: string;
}

export type SearchScope = "all" | "title" | "content" | "tags";
export type SearchOptions = { scope: SearchScope };
