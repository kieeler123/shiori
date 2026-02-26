// src/features/shiori/domain/validators/supportValidator.ts

export type SupportDraft = {
  title: string;
  body: string;
};

export type SupportValidationResult = {
  ok: boolean;
  cleaned: SupportDraft;
  errors: { field: "title" | "body"; message: string }[];
  warnings: { field: "title" | "body"; message: string }[];
};

const RULES = {
  titleMin: 5,
  bodyMin: 20,
  // 너무 긴 입력 방지(선택)
  titleMax: 120,
  bodyMax: 4000,
};

// 공백 정리(연속 공백/줄바꿈 과다 정리)
function normalizeText(input: unknown): string {
  const s = String(input ?? "");
  // \r\n -> \n 통일 + 앞뒤 공백 제거
  const base = s.replace(/\r\n/g, "\n").trim();

  // 줄바꿈 3개 이상은 2개로 축소(너무 지저분한 입력 방지)
  const compactNewlines = base.replace(/\n{3,}/g, "\n\n");

  // 탭/연속 스페이스 정리(문장 가독성 개선)
  const compactSpaces = compactNewlines.replace(/[ \t]{2,}/g, " ");

  return compactSpaces;
}

// "ㅋㅋㅋㅋㅋㅋ", ".....", "aaaaaa" 같은 반복만 있는지(간단 필터)
function isMostlyRepeating(input: string): boolean {
  const s = input.trim();
  if (!s) return true;

  // 같은 문자 반복(6회 이상)
  if (/^(.)\1{5,}$/.test(s)) return true;

  // 기호/구두점만 잔뜩
  if (/^[\W_]+$/.test(s)) return true;

  return false;
}

// 글자 수(공백 포함). 한국어 기준도 일단 char_length로 충분.
function len(s: string) {
  return s.length;
}

export function validateSupportDraft(
  draft: SupportDraft,
): SupportValidationResult {
  const cleaned: SupportDraft = {
    title: normalizeText(draft.title),
    body: normalizeText(draft.body),
  };

  const errors: SupportValidationResult["errors"] = [];
  const warnings: SupportValidationResult["warnings"] = [];

  // --- title ---
  if (len(cleaned.title) < RULES.titleMin) {
    errors.push({
      field: "title",
      message: `제목은 ${RULES.titleMin}자 이상 입력해줘.`,
    });
  }
  if (len(cleaned.title) > RULES.titleMax) {
    errors.push({
      field: "title",
      message: `제목은 ${RULES.titleMax}자 이하로 줄여줘.`,
    });
  }

  // --- body ---
  if (len(cleaned.body) < RULES.bodyMin) {
    errors.push({
      field: "body",
      message: `내용은 ${RULES.bodyMin}자 이상 입력해줘.`,
    });
  }
  if (len(cleaned.body) > RULES.bodyMax) {
    errors.push({
      field: "body",
      message: `내용이 너무 길어. ${RULES.bodyMax}자 이하로 줄여줘.`,
    });
  }

  // (선택) body에 질문 의도가 없으면 경고 정도만
  if (!/[?？]/.test(cleaned.body)) {
    warnings.push({
      field: "body",
      message: "문의라면 질문(무엇이 문제인지/원하는 해결)이 드러나면 더 좋아.",
    });
  }

  return {
    ok: errors.length === 0,
    cleaned,
    errors,
    warnings,
  };
}

/**
 * repo에서 쓰기 좋은 throw 버전
 */
export function assertValidSupportDraft(draft: SupportDraft): SupportDraft {
  const r = validateSupportDraft(draft);
  if (!r.ok) {
    // repo에서는 첫 에러만 던져도 되고, 전체를 합쳐도 됨
    throw new Error(r.errors[0]?.message ?? "Invalid support input");
  }
  return r.cleaned;
}
