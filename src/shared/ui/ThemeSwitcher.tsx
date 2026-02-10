import { useTheme } from "@/shared/theme/useTheme";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <button onClick={() => setTheme("white")}>White</button>
      <button onClick={() => setTheme("black")}>Black</button>
      <button onClick={() => setTheme("blue")}>Blue</button>
    </div>
  );
}
