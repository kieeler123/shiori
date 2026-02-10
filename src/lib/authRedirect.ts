const KEY_NEXT = "shiori.auth.next";

function normalizeNext(next: string, fallback = "/") {
  if (!next) return fallback;

  // 절대 URL이 들어오면 내부 경로로 변환
  if (/^https?:\/\//i.test(next)) {
    try {
      const u = new URL(next);
      const path = `${u.pathname}${u.search}${u.hash}`;
      return path.startsWith("/") ? path : fallback;
    } catch {
      return fallback;
    }
  }

  // 내부 경로만 허용
  if (!next.startsWith("/")) return fallback;

  return next;
}

export function buildNext(pathname: string, search: string) {
  return normalizeNext(`${pathname}${search ?? ""}`, "/");
}

export function saveNext(next: string) {
  try {
    localStorage.setItem(KEY_NEXT, normalizeNext(next, "/"));
  } catch {}
}

export function loadNext(fallback = "/") {
  try {
    return normalizeNext(localStorage.getItem(KEY_NEXT) || fallback, fallback);
  } catch {
    return fallback;
  }
}

export function clearNext() {
  try {
    localStorage.removeItem(KEY_NEXT);
  } catch {}
}

export function callbackUrl() {
  return `${window.location.origin}/auth/callback`;
}
