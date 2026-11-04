// List page for /pokemon: one row per species, 20 per page, paged with ?page=.
import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllSpeciesNames,
  getDefaultFormName,
  getEnglishName,
  getGenus,
  getIdFromUrl,
  getSpecies,
  getSpeciesList,
  getTypeLookup,
  type SpeciesListResponse,
} from "@/lib/pokeapi";
import { normalizeQuery, searchByName } from "@/lib/search";
import { getSmallTypeIconUrl, getSpriteUrl } from "@/lib/sprites";

import { ButtonLink } from "@/components/Button";
import PokemonTableSkeleton from "@/components/PokemonTableSkeleton";
import SearchBox from "@/components/SearchBox";

const PAGE_SIZE = 20;

export const metadata: Metadata = {
  title: "All Pokémon",
};

export default async function PokemonPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string, q?: string }>;
}) {
  const params = await searchParams;

  // Invalid page numbers (abc, 0, -1, 1.5) fall back to page 1.
  const rawPage = params.page ? Number(params.page) : 1;
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const query = params.q ?? "";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-8">
      <h1 className="text-center text-3xl font-bold py-8">All Pokémon</h1>
      {/* Outside the Suspense on purpose: the box must stay mounted (and keep focus)
          while the list below it reloads. */}
      <div className="mb-6">
        <SearchBox initialQuery={query} />
      </div>
      {/* The key includes the query, so a new search shows the skeleton again
          (same reason as the page number: without a new key React keeps the old content). */}
      <Suspense key={`${page}-${query}`} fallback={<PokemonTableSkeleton rows={PAGE_SIZE} />}>
        <PokemonList page={page} query={query} />
      </Suspense>
    </div>
  );
}

/**
 * One page of the table plus the pagination buttons. It's a separate component so
 * the Suspense boundary in PokemonPage can show a skeleton while its data loads.
 */
async function PokemonList({ page, query }: { page: number, query: string }) {
  const [{ entries, hasNext, total }, typeLookup] = await Promise.all([
    getPageEntries(page, query),
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
            <ButtonLink href="/pokemon">Show all Pokémon</ButtonLink>
          ) : (
            <ButtonLink href={pageHref(1, query)}>Back to the first page</ButtonLink>
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
              <th className="w-16 md:w-24 text-left py-4 pl-4 md:pl-8 pr-2">
                #
              </th>
              <th className="w-20 md:w-56 text-left py-4">
                <span className="sr-only">Sprite</span>
              </th>
              <th className="text-left py-4 px-2 md:pr-8">Name</th>
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
                    <Image
                      src={getSpriteUrl(s.id)}
                      alt={getEnglishName(s)}
                      width={48}
                      height={48}
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
          <ButtonLink href={pageHref(page - 1, query)}>
            Previous page
          </ButtonLink>
        )}

        {hasNext && (
          <ButtonLink href={pageHref(page + 1, query)} className="ml-auto">
            Next page
          </ButtonLink>
        )}
      </div>
    </>
  );
}

/**
 * The species entries (name and URL) for one page of the list, and whether
 * another page follows. With a query it pages through the matches instead.
 */
async function getPageEntries(
  page: number,
  query: string,
): Promise<{
    entries: SpeciesListResponse["results"];
    hasNext: boolean;
    /** How many Pokémon the list (or the search) has in total, over all pages. */
    total: number;
  }> {
  const offset = (page - 1) * PAGE_SIZE;

  if (normalizeQuery(query) === "") {
    const data = await getSpeciesList(PAGE_SIZE, offset);
    return { entries: data.results, hasNext: data.next !== null, total: data.count };
  }

  // The API has no search endpoint, so fetch every name (one cached request) and
  // filter them ourselves, then take the current page out of the matches.
  const matches = searchByName(await getAllSpeciesNames(), query);
  return {
    entries: matches.slice(offset, offset + PAGE_SIZE),
    hasNext: offset + PAGE_SIZE < matches.length,
    total: matches.length,
  };
}

// Link to a page of the list. The page number is left out for page 1 (cleaner
// URLs), and the search query is kept, so paging through results stays in the search.
function pageHref(page: number, query: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/pokemon?${queryString}` : "/pokemon";
}
