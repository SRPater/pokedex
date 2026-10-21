import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSpeciesList, getSpecies, getPokemonId, getEnglishName, getListedVarieties } from "@/lib/pokeapi";

export default async function PokemonPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const rawPage = params.page ? Number(params.page) : 1;
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;
  const offset = (page - 1) * 20;
  const data = await getSpeciesList(20, offset);
  const species = await Promise.all(
    data.results.map((entry) => getSpecies(getPokemonId(entry.url))),
  );

  if (data.results.length === 0) notFound();

  return (
    <div className="w-full max-w-5xl mx-auto px-8 pb-8">
      <h1 className="text-3xl font-bold py-8">All Pokémon</h1>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full table-fixed">
          <thead>
            <tr>
              <th className="w-24 text-left py-4 pl-8 pr-2">#</th>
              <th className="w-80 text-left py-4">
                <span className="sr-only">Sprite</span>
              </th>
              <th className="text-left py-4 pl-2 pr-8">Name</th>
            </tr>
          </thead>
          <tbody>
            {species.map((s) => (
              <tr
                key={s.name}
                className="even:bg-gray-50 dark:even:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <td className="py-2 pl-8 pr-2">
                  #{String(s.id).padStart(4, "0")}
                </td>
                <td className="p-2">
                  <div className="flex justify-center">
                    {getListedVarieties(s).map((v) => (
                      <Image
                        key={v.pokemon.name}
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(v.pokemon.url)}.png`}
                        alt={v.pokemon.name}
                        width={48}
                        height={48}
                      />
                    ))}
                  </div>
                </td>
                <td className="py-2 pl-2 pr-8">{getEnglishName(s)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        {page > 1 && (
          <Link
            href={`/pokemon?page=${page - 1}`}
            className="rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Previous page
          </Link>
        )}

        {data.next && (
          <Link
            href={`/pokemon?page=${page + 1}`}
            className="ml-auto rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Next page
          </Link>
        )}
      </div>
    </div>
  );
}
