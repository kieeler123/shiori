// shared/ui/styles/buttonStyles.ts

export const iconBtn = [
  "cursor-pointer h-9 w-9 inline-flex items-center justify-center", // ✅ 고정 크기 + 중앙정렬
  "rounded-xl",
  "transition",
  "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
].join(" ");

export const brandBtn = [
  "cursor-pointer ",
  "min-w-0 truncate",
  "text-base sm:text-lg font-semibold tracking-tight",
  "text-[var(--fg)] hover:opacity-90",
  "transition",
  "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] rounded-lg px-1",
].join(" ");

export const subtleText = "text-xs text-[var(--muted)]";

export const panel = [
  "absolute left-4",
  "top-14",
  "z-50",
  "w-60",
  "rounded-2xl",
  "border",
  "border-zinc-800/60",
  "bg-zinc-950/95",
  "p-2",
  "shadow-xl",
].join(" ");

export const sectionLabel =
  "cursor-pointer text-sm transition px-2 py-1 text-zinc-300 hover:text-zinc-100";

export const menuItemClass = [
  "w-full text-left rounded-xl px-3 py-2 text-sm",
  "text-[var(--fg)]",
  "hover:bg-[var(--hover)] active:bg-[var(--active)]",
  "transition",
  "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
].join(" ");

export const primaryBtn = [
  "h-9 px-3 rounded-xl text-sm font-medium",
  "bg-[var(--primary)] text-[var(--primary-fg)]",
  "hover:opacity-90 transition",
  "focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]",
].join(" ");

export const ghostStrong = [
  "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--hover)]",
].join(" ");
