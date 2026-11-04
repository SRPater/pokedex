// Search helpers for the list page. The species list has only slugs ("mr-mime"),
// so searching works on slugs, and what the visitor types is converted to match.

// Characters kept from what the visitor types. The space is deliberate: it is
// turned into a hyphen below, so removing it here would turn "mr mime" into
// "mrmime". Everything else (dots, apostrophes, colons, symbols) is dropped.
const ALLOWED = "abcdefghijklmnopqrstuvwxyz0123456789 -";

/**
 * Turns typed text into something comparable with a species slug:
 * "Mr. Mime" -> "mr-mime", "Flabébé" -> "flabebe", "Type: Null" -> "type-null".
 */
export function normalizeQuery(query: string): string {
  // NFD splits an accented letter into the plain letter plus a separate accent
  // mark; the mark isn't in ALLOWED, so the filter below drops it ("é" -> "e").
  const text = query.toLowerCase().normalize("NFD");
  const filteredText = [...text].filter((ch) => ALLOWED.includes(ch)).join("");

  // Spaces become hyphens like in slugs; filter(Boolean) removes the empty
  // pieces left by leading, trailing or doubled spaces.
  return filteredText.trim().split(" ").filter(Boolean).join("-");
}

/**
 * The items whose name contains the query anywhere ("chu" finds Pikachu, Raichu and
 * Pichu). An empty query matches everything.
 */
export function searchByName<T extends { name: string }>(items: T[], query: string): T[] {
  const normalized = normalizeQuery(query);
  if (normalized === "") return items;
  return items.filter((item) => item.name.includes(normalized));
}
