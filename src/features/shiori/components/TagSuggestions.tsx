type TagSuggestionsProps = {
  suggestions: string[];
  onPick: (tag: string) => void;
};

export default function TagSuggestions({
  suggestions,
  onPick,
}: TagSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <div
      className="
        absolute
        rounded-xl
        border border-[var(--border-soft)]
        bg-[var(--menu-bg)]
        shadow-lg
        backdrop-blur
        overflow-hidden
        z-40
      "
    >
      {suggestions.map((tag) => (
        <div
          key={tag}
          onClick={() => onPick(tag)}
          className="
            px-3 py-1.5
            text-sm
            t3
            cursor-pointer
            hover:bg-[var(--item-hover-bg)]
            transition-colors
          "
        >
          #{tag}
        </div>
      ))}
    </div>
  );
}
