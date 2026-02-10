export function getEmptyMessage(opts: {
  isSearching: boolean;
  onlyCommented: boolean;
  selectedTag: string | null;
}) {
  const { isSearching, onlyCommented, selectedTag } = opts;

  if (isSearching) return "검색 결과가 없습니다.";
  if (onlyCommented) return "댓글이 달린 글이 없습니다.";
  if (selectedTag) return "해당 태그의 글이 없습니다.";
  return "아직 로그가 없습니다.";
}
