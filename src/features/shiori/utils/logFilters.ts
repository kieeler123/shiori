export function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();
  const tags = log.tags ?? [];

  if (title.length < 2) return true;
  if (content.length < 30) return true;

  // 명시적으로 test 태그가 붙은 글만 숨김
  if (tags.some((tag) => tag.toLowerCase() === "test")) return true;

  // 완전히 깨진 데이터만 숨김: 같은 문자 20회 이상 연속
  const brokenRepeated = /(.)\1{19,}/;

  if (brokenRepeated.test(title) || brokenRepeated.test(content)) {
    return true;
  }

  return false;
}
