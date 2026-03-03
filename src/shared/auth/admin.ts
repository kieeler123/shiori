// src/shared/auth/admin.ts
const ADMIN_EMAILS = ["kieeler456@gmail.com"]; // 너 이메일

export function isAdmin(user?: { email?: string | null } | null) {
  const email = user?.email?.toLowerCase();
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
