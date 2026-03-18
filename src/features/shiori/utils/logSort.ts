export type LogSort = "recent" | "views" | "comments";
export type RelatedLogSort = "recent" | "views";

export function nextLogSort(sort: LogSort): LogSort {
  return sort === "recent" ? "views" : sort === "views" ? "comments" : "recent";
}

export function nextRelatedLogSort(sort: RelatedLogSort): RelatedLogSort {
  return sort === "recent" ? "views" : "recent";
}

export function sortKeyToLabelKey(sort: LogSort | RelatedLogSort) {
  switch (sort) {
    case "recent":
      return "logs.sort.recent";
    case "views":
      return "logs.sort.views";
    case "comments":
      return "logs.sort.comments";
    default:
      return "logs.sort.recent";
  }
}
