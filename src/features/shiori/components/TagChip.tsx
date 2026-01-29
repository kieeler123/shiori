type Props = {
  tag: string;
  active?: boolean;
  onClick: (tag: string) => void;
  className?: string;
  titlePrefix?: string; // 옵션: 툴팁 커스터마이즈
};

export default function TagChip({
  tag,
  active = false,
  onClick,
  className = "",
  titlePrefix = "태그 필터",
}: Props) {
  const base =
    "cursor-pointer select-none inline-flex items-center gap-1 " +
    "rounded-full px-3 py-1 text-xs transition " +
    "border focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

  const inactiveStyle =
    "border-zinc-800/70 text-zinc-400 " +
    "hover:bg-zinc-900/70 hover:text-zinc-100";

  const activeStyle =
    "border-zinc-700/80 bg-zinc-900/80 text-zinc-100 " +
    "hover:bg-zinc-900 hover:border-zinc-600/80";

  return (
    <button
      type="button"
      className={`${base} ${active ? activeStyle : inactiveStyle} ${className}`}
      onClick={() => onClick(tag)}
      aria-pressed={active}
      title={`${titlePrefix}: #${tag}`}
    >
      <span className="opacity-80">#</span>
      <span>{tag}</span>
    </button>
  );
}
