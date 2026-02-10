import { useTheme } from "@/shared/theme/useTheme";

export function ThemeToggle() {
  const { toggle, theme } = useTheme();

  return (
    <button
      onClick={toggle}
      className="text-sm text-[var(--muted)] hover:text-[var(--fg)] transition"
    >
      {theme === "white" ? "black" : "white"}
    </button>
  );
}
