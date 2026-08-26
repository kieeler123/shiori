export function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
  importSource?: string | null;
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();
  const tags = log.tags ?? [];

  // test 태그는 Markdown이어도 숨김
  if (tags.some((tag) => tag.toLowerCase() === "test")) {
    return true;
  }

  // Markdown은 일반 품질 검사만 예외
  if (log.importSource === "markdown") {
    return false;
  }

  if (title.length < 2) return true;
  if (content.length < 30) return true;

  const brokenRepeated = /(.)\1{19,}/;

  if (brokenRepeated.test(title) || brokenRepeated.test(content)) {
    return true;
  }

  return false;
}
