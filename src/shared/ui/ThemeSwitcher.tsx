import { useTheme } from "@/shared/theme/useTheme";

export function ThemeSwitcher() {
  const { setTheme } = useTheme();

  return (
    <div className="flex gap-2">
      <button onClick={() => setTheme("navy")}>navy</button>
      <button onClick={() => setTheme("darkGray")}>darkGray</button>
      <button onClick={() => setTheme("pureDark")}>pureDark</button>
      <button onClick={() => setTheme("brownArchive")}>brownArchive</button>
    </div>
  );
}
