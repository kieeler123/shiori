export const TAG_LIMIT = 20;
export const TAG_SUGGEST_LIMIT = 8;

export function parseTagsInput(
  input: string,
  limit: number = TAG_LIMIT,
): string[] {
  const raw = String(input ?? "").trim();
  if (!raw) return [];

  // 공백/쉼표/줄바꿈/탭 기준 분리
  const parts = raw.split(/[,\s]+/g);

  const out: string[] = [];
  const seen = new Set<string>();

  for (const p of parts) {
    const cleaned = sanitizeTag(p.replace(/^#/, "")); // 혹시 # 붙여도 허용
    if (!cleaned) continue;
    if (seen.has(cleaned)) continue;

    seen.add(cleaned);
    out.push(cleaned);

    if (out.length >= limit) break;
  }

  return out;
}

/**
 * 태그 정규화:
 * - 소문자
 * - 허용 문자만 남김 (영문/숫자/한글/_/-)
 * - 공백 제거
 */
export function sanitizeTag(raw: string): string {
  return String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9가-힣_-]/g, "");
}

/**
 * 텍스트에서 #태그를 추출해 배열로 반환
 * - 중복 제거
 * - TAG_LIMIT 제한
 */
export function extractTags(text: string, limit: number = TAG_LIMIT): string[] {
  const safeText = String(text ?? "");
  const matches = safeText.match(/#([^\s#]+)/g) || [];

  const out: string[] = [];
  const seen = new Set<string>();

  for (const m of matches) {
    // m 예: "#React!"
    const cleaned = sanitizeTag(m.slice(1));
    if (!cleaned) continue;
    if (seen.has(cleaned)) continue;

    seen.add(cleaned);
    out.push(cleaned);

    if (out.length >= limit) break;
  }

  return out;
}

export type TagToken = {
  start: number; // '#' 포함 시작 인덱스
  end: number; // 토큰 끝(공백/다음 #/문자열끝)
  query: string; // '#' 제외 현재 입력(prefix) - sanitize 적용
};

/**
 * 커서가 현재 편집 중인 "#태그 토큰"을 찾는다.
 * - '#' 앞이 공백/문장 시작이어야 태그로 인정
 * - 토큰 경계: 공백 또는 다음 '#'
 */
export function getActiveTagToken(
  text: string,
  cursor: number,
): TagToken | null {
  const s = String(text ?? "");

  let c = Number.isFinite(cursor) ? cursor : 0;
  if (c < 0) c = 0;
  if (c > s.length) c = s.length;

  const left = s.slice(0, c);
  const hashPos = left.lastIndexOf("#");
  if (hashPos === -1) return null;

  const prev = s[hashPos - 1];
  const isValidStart = hashPos === 0 || /\s/.test(prev);
  if (!isValidStart) return null;

  // token end 찾기
  let end = c;
  while (end < s.length) {
    const ch = s[end];
    if (ch === " " || ch === "\n" || ch === "\t") break;
    if (ch === "#") break;
    end++;
  }

  // 커서가 토큰 내부인지 확인
  if (c < hashPos + 1 || c > end) return null;

  const rawQuery = s.slice(hashPos + 1, c);
  const query = sanitizeTag(rawQuery); // 여기서 정규화

  return { start: hashPos, end, query };
}

/**
 * 추천 생성:
 * - query가 비면 상위 태그(앞쪽) 반환
 * - prefix 우선, includes 보조
 * - 중복 제거 + 제한
 */
export function suggestTags(
  allTags: string[],
  query: string,
  limit: number = TAG_SUGGEST_LIMIT,
): string[] {
  const source = Array.isArray(allTags) ? allTags : [];
  const q = sanitizeTag(query);

  const normalized = source.map((t) => sanitizeTag(t)).filter(Boolean);

  if (!q) return [...new Set(normalized)].slice(0, limit);

  const prefix: string[] = [];
  const contains: string[] = [];

  for (const t of normalized) {
    if (t.startsWith(q)) prefix.push(t);
    else if (t.includes(q)) contains.push(t);
  }

  return [...new Set([...prefix, ...contains])].slice(0, limit);
}

type ApplyResult = { nextText: string; nextCursor: number };

/**
 * 추천 태그를 선택했을 때:
 * - 현재 토큰을 "#picked "로 치환
 * - picked 정규화
 * - 커서를 공백 뒤로 이동
 */
export function applyTagSuggestion(
  text: string,
  token: TagToken,
  picked: string,
): ApplyResult {
  const s = String(text ?? "");
  const safePicked = sanitizeTag(picked);

  if (!safePicked) {
    return { nextText: s, nextCursor: Math.min(token.start + 1, s.length) };
  }

  const before = s.slice(0, token.start);
  const after = s.slice(token.end);

  // "#tag " 삽입
  const insert = `#${safePicked} `;
  const nextText = before + insert + after;
  const nextCursor = (before + insert).length;

  return { nextText, nextCursor };
}
