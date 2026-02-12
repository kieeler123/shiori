import type { ThemeTokens } from "./theme.types";

export function applyThemeTokens(tokens: ThemeTokens) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(tokens)) {
    root.style.setProperty(k, v);
  }
}

/** 선택사항: 커스텀 테마 해제하고 싶을 때 */
export function clearThemeTokens() {
  //   const root = document.documentElement;
  // 커스텀 토큰을 인라인으로 넣는 방식이면 제거 로직이 필요할 수 있음.
  // 지금 단계에서는 비워둬도 OK.
}
