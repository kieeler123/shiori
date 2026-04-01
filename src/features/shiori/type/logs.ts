export type AttachmentItem = {
  id: string;
  path: string;
  name: string;
  mimeType: string;
  size: number;
  bucket: string;
  publicUrl?: string | null;
};

export type LinkPreviewItem = {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
};

export type LogItem = {
  id: string;
  userId: string | null;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string | null;
  commentCount: number;
  viewCount: number;

  sourceDate?: string | null;

  profile: { nickname: string | null } | null;
};

export type LogSort = "recent" | "views";

export type LogListItem = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  display_date: string | null;
  view_count?: number | null;
  user_id: string | null;
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
export type DbLogRow = {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string | null;
  comment_count: number;
  view_count: number;
  source_date: string | null;
  table_data?: TableData | null;
  attachments?: AttachmentItem[] | null;
  links?: LinkPreviewItem[] | null;

  profile: { nickname: string | null; is_deleted?: boolean | null }[] | null;
};

export type TableColumn = {
  id: string;
  label: string;
};

export type TableRow = {
  id: string;
  cells: Record<string, string>;
};

export type SingleTable = {
  columns: TableColumn[];
  rows: TableRow[];
};

export type TableData = {
  tables: Record<string, SingleTable>;
};

export type LogEditorProps = {
  initialTitle?: string | null;
  initialContent?: string | null;
  initialTags?: string[];
  initialTableData?: TableData | null;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (value: {
    title: string;
    content: string;
    tags: string[];
    table_data?: TableData | null;
  }) => void;
};

export type TrashListRow = {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string | null;
  deleted_at: string;
  deleted_by: String;
};

export type LogOrderBy =
  | "source_date"
  | "created_at"
  | "view_count"
  | "comment_count"
  | "display_date";

export type LogListQuery = {
  limit?: number;
  offset?: number;
  orderBy?: LogOrderBy;
  ascending?: boolean;
  userId?: string | null;
};
