export function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();
  const tags = log.tags ?? [];

  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  if (title.length < 2) return true;
  if (content.length < 30) return true;

  // 테스트용 글 숨김
  if (tags.some((tag) => tag.toLowerCase() === "test")) return true;
  if (titleLower.includes("test")) return true;
  if (contentLower.includes("test")) return true;
  if (title.includes("테스트")) return true;
  if (content.includes("테스트")) return true;

  // 완전히 깨진 데이터만 숨김: 같은 문자 20회 이상 연속
  // ●●●● 같은 구분선은 감정기록에서 쓸 수 있으니 너무 짧게 잡지 않음
  const brokenRepeated = /(.)\1{19,}/;
  if (brokenRepeated.test(title) || brokenRepeated.test(content)) return true;

  return false;
}
