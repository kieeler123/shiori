// src/lib/authRedirect.ts
const KEY_NEXT = "shiori.auth.next";

export function buildNext(pathname: string, search: string) {
  const next = `${pathname}${search ?? ""}`;
  return next && next !== "" ? next : "/";
}

export function saveNext(next: string) {
  try {
    localStorage.setItem(KEY_NEXT, next || "/");
  } catch {}
}

export function loadNext(fallback = "/") {
  try {
    return localStorage.getItem(KEY_NEXT) || fallback;
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
