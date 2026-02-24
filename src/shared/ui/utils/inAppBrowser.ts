// shared/utils/inAppBrowser.ts
export function isInAppBrowser(ua = navigator.userAgent) {
  const s = ua.toLowerCase();
  return (
    s.includes("kakaotalk") ||
    s.includes("instagram") ||
    s.includes("fbav") || // facebook
    s.includes("fb_iab") ||
    s.includes("naver") ||
    s.includes("daum") ||
    s.includes("line")
  );
}

export function openExternalTry() {
  // 강제는 불가하지만, "브라우저에서 열기" UX로는 충분히 가치 있음
  window.open(window.location.href, "_blank", "noopener,noreferrer");
}
