import React from "react";

type HighlightTone = "title" | "body" | "tag";

function escRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightText(
  text: string,
  query: string,
  tone: HighlightTone = "body",
) {
  const q = query.trim();
  if (!q) return text;

  const re = new RegExp(`(${escRegExp(q)})`, "ig");
  const parts = text.split(re);

  const bgVar =
    tone === "title"
      ? "var(--hl-title-bg)"
      : tone === "tag"
        ? "var(--hl-tag-bg)"
        : "var(--hl-body-bg)";

  const fgVar =
    tone === "title"
      ? "var(--hl-title-fg)"
      : tone === "tag"
        ? "var(--hl-tag-fg)"
        : "var(--hl-body-fg)";

  return parts.map((part, i) => {
    const hit = part.toLowerCase() === q.toLowerCase();
    if (!hit) return <React.Fragment key={i}>{part}</React.Fragment>;

    return (
      <mark
        key={i}
        className="rounded px-0.5"
        style={{ background: bgVar, color: fgVar }}
      >
        {part}
      </mark>
    );
  });
}
