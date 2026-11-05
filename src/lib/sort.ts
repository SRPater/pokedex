// Sorting for the list page. The sort lives in the URL as ?sort=, with the
// default (number) left out.

/** The values ?sort= can take; anything else is treated as the default. */
export const SORT_OPTIONS = [
  "number",
  "number-desc",
  "name",
  "name-desc",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
export const DEFAULT_SORT: SortOption = "number";
export const SORT_LABELS: Record<SortOption, string> = {
  number: "Number: low to high",
  "number-desc": "Number: high to low",
  name: "Name: A to Z",
  "name-desc": "Name: Z to A",
};

/** Turns the raw ?sort= value into a valid option, ignoring case; unknown values give the default. */
export function parseSort(value: string | undefined): SortOption {
  return (
    SORT_OPTIONS.find((option) => option === value?.toLowerCase()) ??
    DEFAULT_SORT
  );
}

/**
 * Returns a sorted copy of the list. Sorting by name uses the slugs, so "mr-mime"
 * sorts under M. The number sort needs no work, because the list comes in
 * Pokédex order (see getAllSpeciesNames); the "-desc" options just reverse it.
 */
export function sortSpecies<T extends { name: string }>(
  items: T[],
  sort: SortOption,
): T[] {
  // Copy first: .sort() and .reverse() change the array they are called on.
  const sorted = [...items];

  if (sort === "name" || sort === "name-desc")
    sorted.sort((a, b) => a.name.localeCompare(b.name));

  if (sort.endsWith("-desc")) sorted.reverse();

  return sorted;
}

/** The columns of the list that can be sorted. */
export type SortColumn = "number" | "name";

/**
 * The sort to switch to when the header of `column` is clicked: that column
 * ascending, or descending if it is already sorted ascending. Clicking a column
 * that isn't the current sort starts it ascending.
 */
export function nextSort(current: SortOption, column: SortColumn): SortOption {
  if (column === "number")
    return current === "number" ? "number-desc" : "number";
  return current === "name" ? "name-desc" : "name";
}

/** Which way the list is sorted on `column`, or null when it is sorted on another column. */
export function sortDirection(
  current: SortOption,
  column: SortColumn,
): "ascending" | "descending" | null {
  return current === column
    ? "ascending"
    : current === `${column}-desc`
      ? "descending"
      : null;
}
