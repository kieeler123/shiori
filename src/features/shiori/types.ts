export type LogItem = {
  id: string;
  userId: string | null;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string | null;
  commentCount: number;
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

export type ShioriItem = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type ListQuery = {
  q?: string; // search text
  tags?: string[]; // filter tags
  sort?: "new" | "old";
};

export interface ShioriRepo {
  list(query?: ListQuery): Promise<ShioriItem[]>;
  create(
    input: Omit<ShioriItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<ShioriItem>;
  update(
    id: string,
    patch: Partial<Omit<ShioriItem, "id">>,
  ): Promise<ShioriItem>;
  remove(id: string): Promise<void>;
}
