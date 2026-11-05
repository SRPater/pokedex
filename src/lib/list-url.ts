import { DEFAULT_SORT, type SortOption } from "./sort";

/** Everything the list URL can say: the search text, the sort and the page number. */
export type ListParams = {
  query: string;
  sort: SortOption;
  page: number;
};

/**
 * The URL of the list page for these parameters, leaving out anything that
 * equals its default (no query, the default sort, page 1), so the plain list is
 * just "/pokemon". This is the only place that builds list URLs, so the
 * pagination buttons, the sortable headers, the search box and the sort
 * dropdown stay consistent with each other.
 */
export function listHref(params: ListParams): string {
  const search = new URLSearchParams();
  if (params.query !== "") search.set("q", params.query);
  if (params.sort !== DEFAULT_SORT) search.set("sort", params.sort);
  if (params.page > 1) search.set("page", params.page.toString());

  return search.size > 0 ? `/pokemon?${search.toString()}` : "/pokemon";
}
