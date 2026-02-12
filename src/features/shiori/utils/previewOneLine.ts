export function previewText(s: string, max = 110) {
  const oneLine = String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}
