import { useState, useEffect } from "react";
import { getActiveTagToken, suggestTags } from "../utils/tags";

export function useTagAutocomplete(
  text: string,
  cursor: number,
  allTags: string[],
): string[] {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const token = getActiveTagToken(text, cursor);
    if (!token) return setSuggestions([]);
    setSuggestions(suggestTags(allTags, token.query));
  }, [text, cursor, allTags]);

  return suggestions;
}
