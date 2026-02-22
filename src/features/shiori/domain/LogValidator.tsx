// features/shiori/domain/logValidators.ts
export type SubmitValue = {
  title: string;
  content: string;
  tags: string[];
};

export function normalizeTagsText(input: string): string[] {
  return [
    ...new Set(
      String(input ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  ].slice(0, 10);
}

export function normalizeTagsArray(tags: string[]): string[] {
  return [
    ...new Set(
      (tags ?? []).map((t) => String(t).trim().toLowerCase()).filter(Boolean),
    ),
  ].slice(0, 10);
}

export function validateCreate(input: SubmitValue) {
  const title = (input.title ?? "").trim();
  const content = (input.content ?? "").trim();
  const tags = normalizeTagsArray(input.tags);

  if (!title) throw new Error("제목을 입력해주세요.");
  if (!content) throw new Error("내용을 입력해주세요.");
  if (content.length < 2) throw new Error("내용이 너무 짧습니다.");

  return { title, content, tags };
}

export function validateUpdate(input: SubmitValue) {
  const title = (input.title ?? "").trim();
  const content = (input.content ?? "").trim();
  const tags = normalizeTagsArray(input.tags);

  if (!title) throw new Error("제목을 입력해주세요.");
  if (!content) throw new Error("내용을 입력해주세요.");

  return { title, content, tags };
}

// 화면에서 “쓰레기 데이터” 숨기기용
export function isEffectivelyEmpty(input: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (input.title ?? "").trim();
  const content = (input.content ?? "").trim();
  const tags = (input.tags ?? []).filter(Boolean);
  return title.length === 0 && content.length === 0 && tags.length === 0;
}

// 화면에서 중복 숨김용 키
export function makeDedupeKey(input: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (input.title ?? "").trim().toLowerCase();
  const content = (input.content ?? "").trim().toLowerCase();
  const tags = normalizeTagsArray(input.tags ?? [])
    .sort()
    .join(",");
  return `${title}||${content}||${tags}`;
}
