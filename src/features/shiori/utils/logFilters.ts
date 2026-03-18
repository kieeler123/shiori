export function shouldHideFromList(log: {
  title?: string;
  content?: string;
  tags?: string[];
}) {
  const title = (log.title ?? "").trim();
  const content = (log.content ?? "").trim();

  if (title.length < 2) return true;
  if (content.length < 30) return true;

  const repeated = /(.)\1{9,}/;
  if (repeated.test(title) || repeated.test(content)) return true;

  if ((log.tags ?? []).includes("test")) return true;

  return false;
}
