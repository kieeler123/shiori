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
    <div className="absolute bg-zinc-800 border rounded shadow">
      {suggestions.map((tag) => (
        <div
          key={tag}
          onClick={() => onPick(tag)}
          className="px-3 py-1 hover:bg-zinc-700 cursor-pointer"
        >
          #{tag}
        </div>
      ))}
    </div>
  );
}
