// List page for /pokemon: one row per species, 20 per page. ?q= searches the
// names, ?sort= orders them and ?page= pages through the result; everything
// that is left out means "the default".
import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { listHref } from "@/lib/list-url";
import {
  getAllSpeciesNames,
  getDefaultFormName,
  getEnglishName,
  getGenus,
  getIdFromUrl,
  getSpecies,
  getTypeLookup,
  type SpeciesListResponse,
} from "@/lib/pokeapi";
import { normalizeQuery, searchByName } from "@/lib/search";
import {
  nextSort,
  parseSort,
  sortDirection,
  sortSpecies,
  type SortColumn,
  type SortOption,
} from "@/lib/sort";
import { getSmallTypeIconUrl, getSpriteUrl } from "@/lib/sprites";

import { ButtonLink } from "@/components/Button";
import ListControls from "@/components/ListControls";
import PokemonTableSkeleton from "@/components/PokemonTableSkeleton";

const PAGE_SIZE = 20;

export const metadata: Metadata = {
  title: "All Pokémon",
};

export default async function PokemonPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;

  const query = params.q ?? "";
  const sort = parseSort(params.sort);
  // Invalid page numbers (abc, 0, -1, 1.5) fall back to page 1.
  const rawPage = params.page ? Number(params.page) : 1;
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-8">
      <h1 className="text-center text-3xl font-bold py-8">All Pokémon</h1>
      {/* Outside the Suspense on purpose: the box must stay mounted (and keep
          focus) while the list below it reloads. */}
      <div className="mb-6">
        <ListControls initialQuery={query} initialSort={sort} />
      </div>
      {/* The key includes the query and the sort, so changing either shows the
          skeleton again (same reason as the page number: without a new key React
          keeps the old content). */}
      <Suspense
        key={`${query}-${sort}-${page}`}
        fallback={<PokemonTableSkeleton rows={PAGE_SIZE} />}
      >
        <PokemonList query={query} sort={sort} page={page} />
      </Suspense>
    </div>
  );
}

/**
 * One page of the table plus the pagination buttons. It's a separate component so
 * the Suspense boundary in PokemonPage can show a skeleton while its data loads.
 */
async function PokemonList({
  query,
  sort,
  page,
}: {
  query: string;
  sort: SortOption;
  page: number;
}) {
  const [{ entries, hasNext, total }, typeLookup] = await Promise.all([
    getPageEntries(query, sort, page),
    getTypeLookup(),
  ]);

  // An empty page is not an error: either a search without matches, or a page
  // number past the end of the list or of the matches. Each shows a message and a
  // way back.
  if (entries.length === 0) {
    const noMatches = normalizeQuery(query) !== "" && total === 0;
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">
          {noMatches
            ? `No Pokémon found for “${query}”.`
            : "There are no Pokémon on this page."}
        </p>
        <div className="mt-6">
          {noMatches ? (
            <ButtonLink href={listHref({ query: "", sort, page: 1 })}>
              Show all Pokémon
            </ButtonLink>
          ) : (
            <ButtonLink href={listHref({ query, sort, page: 1 })}>
              Back to the first page
            </ButtonLink>
          )}
        </div>
      </div>
    );
  }

  const species = await Promise.all(
    entries.map((entry) => getSpecies(getIdFromUrl(entry.url))),
  );

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-950">
              <th
                aria-sort={sortDirection(sort, "number") ?? "none"}
                className="w-16 md:w-24 text-left py-4 pl-4 md:pl-8 pr-2"
              >
                <SortLink column="number" label="#" query={query} sort={sort} />
              </th>
              <th className="w-20 md:w-56 text-left py-4">
                <span className="sr-only">Sprite</span>
              </th>
              <th
                aria-sort={sortDirection(sort, "name") ?? "none"}
                className="text-left py-4 px-2 md:pr-8"
              >
                <SortLink
                  column="name"
                  label="Name"
                  query={query}
                  sort={sort}
                />
              </th>
              <th className="hidden md:table-cell text-left py-4">Category</th>
              <th className="hidden md:table-cell w-32 text-left py-4">Type</th>
            </tr>
          </thead>
          <tbody>
            {species.map((s) => (
              <tr
                key={s.name}
                className="relative bg-gray-50 even:bg-gray-100 hover:bg-gray-200 dark:bg-gray-950 dark:even:bg-gray-900 dark:hover:bg-gray-800"
              >
                <td className="py-2 pl-4 md:pl-8 pr-2">
                  #{String(s.id).padStart(4, "0")}
                </td>
                <td className="p-2">
                  <div className="flex justify-center">
                    {/* unoptimized: these sprites are tiny PNGs, so resizing them gains
                        almost nothing, but every one would count as a Vercel image
                        transformation (the free plan allows 5,000). The browser loads
                        them straight from GitHub instead. */}
                    <Image
                      src={getSpriteUrl(s.id)}
                      alt={getEnglishName(s)}
                      width={48}
                      height={48}
                      unoptimized
                    />
                  </div>
                </td>
                <td className="py-2 px-2 md:pr-8">
                  {/* Stretched link: its ::after layer covers the whole (relative) row, so the entire row is clickable. */}
                  <Link
                    href={`/pokemon/${s.name}`}
                    className="after:absolute after:inset-0"
                  >
                    {getEnglishName(s)}
                  </Link>
                </td>
                <td className="hidden md:table-cell py-2 pr-4 text-gray-500">
                  {getGenus(s)}
                </td>
                <td className="hidden md:table-cell p-2">
                  {/* Types belong to forms, so look them up by the default form's name. */}
                  <div className="flex gap-2">
                    {(typeLookup.get(getDefaultFormName(s)) ?? []).map((t) => (
                      <Image
                        key={t.name}
                        src={getSmallTypeIconUrl(t.id)}
                        alt={t.name}
                        width={60}
                        height={60}
                        className="h-9 w-9"
                        unoptimized // already a small 60x60 file; see the sprite above
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        {page > 1 && (
          <ButtonLink href={listHref({ query, sort, page: page - 1 })}>
            Previous page
          </ButtonLink>
        )}

        {hasNext && (
          <ButtonLink
            href={listHref({ query, sort, page: page + 1 })}
            className="ml-auto"
          >
            Next page
          </ButtonLink>
        )}
      </div>
    </>
  );
}

/**
 * Column header that sorts the list by its column when clicked: ascending first,
 * then descending. The arrow shows the current direction (screen readers get it
 * from aria-sort on the header cell). The link goes to page 1, because the old
 * page number means nothing in a new order. It's a plain link, so it stays a
 * Server Component.
 */
function SortLink({
  column,
  label,
  query,
  sort,
}: {
  column: SortColumn;
  label: string;
  query: string;
  sort: SortOption;
}) {
  const direction = sortDirection(sort, column);

  return (
    <Link
      href={listHref({ query, sort: nextSort(sort, column), page: 1 })}
      // The visible text is just "#" for the number column, so name the action.
      aria-label={`Sort by ${column}`}
      // -mx-2 cancels the px-2, so the text stays aligned with the cells below.
      className="-mx-2 inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800"
    >
      {label}
      {direction && (
        <span aria-hidden="true" className="text-sm text-gray-500">
          {direction === "ascending" ? "↑" : "↓"}
        </span>
      )}
    </Link>
  );
}

/**
 * The species entries (name and URL) for one page of the list after search and
 * sorting, and whether another page follows.
 */
async function getPageEntries(
  query: string,
  sort: SortOption,
  page: number,
): Promise<{
  entries: SpeciesListResponse["results"];
  hasNext: boolean;
  /** How many Pokémon the list (or the search) has in total, over all pages. */
  total: number;
}> {
  const offset = (page - 1) * PAGE_SIZE;

  // The API can't search or sort, so fetch every name (one cached request),
  // filter and sort them ourselves, and take the current page out of the result.
  const matches = sortSpecies(
    searchByName(await getAllSpeciesNames(), query),
    sort,
  );
  return {
    entries: matches.slice(offset, offset + PAGE_SIZE),
    hasNext: offset + PAGE_SIZE < matches.length,
    total: matches.length,
  };
}
