// List page for /pokemon: one row per species, 20 per page, paged with ?page=.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import {
  getSpeciesList,
  getSpecies,
  getIdFromUrl,
  getEnglishName,
  getTypeLookup,
  getDefaultFormName,
  getGenus,
} from "@/lib/pokeapi";
import { getSpriteUrl, getSmallTypeIconUrl } from "@/lib/sprites";

import PokemonTableSkeleton from "@/components/PokemonTableSkeleton";
import { ButtonLink } from "@/components/Button";

const PAGE_SIZE = 20;

export const metadata = {
  title: "All Pokémon",
};

export default async function PokemonPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;

  // Invalid page numbers (abc, 0, -1, 1.5) fall back to page 1.
  const rawPage = params.page ? Number(params.page) : 1;
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-8">
      <h1 className="text-center text-3xl font-bold py-8">All Pokémon</h1>
      <Suspense key={page} fallback={<PokemonTableSkeleton />}>
        <PokemonList page={page} />
      </Suspense>
    </div>
  );
}

async function PokemonList({ page }: { page: number }) {
  const offset = (page - 1) * PAGE_SIZE;
  const [data, typeLookup] = await Promise.all([
    getSpeciesList(PAGE_SIZE, offset),
    getTypeLookup(),
  ]);

  // Pages past the end of the list are a 404.
  if (data.results.length === 0) notFound();

  const species = await Promise.all(
    data.results.map((entry) => getSpecies(getIdFromUrl(entry.url))),
  );

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-950">
              <th className="w-16 md:w-24 text-left py-4 pl-4 md:pl-8 pr-2">#</th>
              <th className="w-20 md:w-56 text-left py-4">
                <span className="sr-only">Sprite</span>
              </th>
              <th className="text-left py-4 pl-2 pr-2 md:pr-8">Name</th>
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
                <td className="py-2 pl-2 pr-2 md:pr-8">
                  {/* Stretched link: its ::after layer covers the whole (relative) row, so the entire row is clickable. */}
                  <Link
                    href={`/pokemon/${s.name}`}
                    className="after:absolute after:inset-0"
                  >
                    {getEnglishName(s)}
                  </Link>
                </td>
                <td className="hidden md:table-cell py-2 pr-4 text-gray-500">{getGenus(s)}</td>
                <td className="hidden md:table-cell p-2">
                  <div className="flex gap-2">
                    {(typeLookup.get(getDefaultFormName(s)) ?? []).map((t) => (
                      <Image
                        key={t.name}
                        src={getSmallTypeIconUrl(t.id)}
                        alt={t.name}
                        width={60}
                        height={60}
                        className="h-10 w-10 rounded-full"
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
          <ButtonLink href={`/pokemon?page=${page - 1}`}>
            Previous page
          </ButtonLink>
        )}

        {data.next && (
          <ButtonLink href={`/pokemon?page=${page + 1}`} className="ml-auto">
            Next page
          </ButtonLink>
        )}
      </div>
    </>
  );
}
