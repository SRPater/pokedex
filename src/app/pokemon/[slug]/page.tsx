import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getSpecies,
  getPokemonForm,
  getPokemon,
  getIdFromUrl,
  getEnglishName,
  getFormName,
} from "@/lib/pokeapi";
import { STAT_LABELS, MAX_STAT, MAX_TOTAL, formatHeight, formatWeight, formatSlug } from "@/lib/display";
import Card from "@/components/Card";
import StatBar from "@/components/StatBar";

export default async function PokemonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ form?: string }>;
}) {
  const { slug } = await params;
  const { form } = await searchParams;

  let species;
  try {
    species = await getSpecies(slug);
  } catch {
    notFound();
  }

  if (slug !== species.name) {
    redirect(`/pokemon/${species.name}`);
  }

  const selected =
    species.varieties.find((v) => v.pokemon.name === form) ??
    species.varieties.find((v) => v.is_default) ??
    species.varieties[0];

  const pokemon = await getPokemon(selected.pokemon.name);
  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  const forms = await Promise.all(
    species.varieties.map((v) => getPokemonForm(v.pokemon.name)),
  );

  const entries = forms.map((form, i) => ({
    key: species.varieties[i].pokemon.name,
    label: getFormName(form, species),
    id: getIdFromUrl(species.varieties[i].pokemon.url),
  }));

  const selectedLabel = entries.find(
    (entry) => entry.key === selected.pokemon.name,
  )?.label;

  const uniqueEntries = entries.filter(
    (entry, i) => entries.findIndex((e) => e.label === entry.label) === i,
  );

  const otherEntries = uniqueEntries.filter(
    (entry) => entry.key !== selected.pokemon.name,
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-8 pb-8">
      <h1 className="text-center text-3xl font-bold py-8">
        #{String(species.id).padStart(4, "0")} {getEnglishName(species)}
      </h1>
      <Image
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getIdFromUrl(selected.pokemon.url)}.png`}
        alt={getEnglishName(species)}
        width={256}
        height={256}
        className="mx-auto"
      />
      {selectedLabel && selectedLabel !== getEnglishName(species) && (
        <p className="mt-2 text-center text-gray-500">{selectedLabel}</p>
      )}
      <div className="mt-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card title="Overview">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-28" />
                <col />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold">
                    Type
                  </th>
                  {pokemon.types.map((t) => (
                    <td key={t.type.name} className="py-2">
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${getIdFromUrl(t.type.url)}.png`}
                        alt={t.type.name}
                        width={200}
                        height={40}
                        className="h-6 w-auto"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold">
                    Height
                  </th>
                  <td colSpan={2} className="py-2">
                    {formatHeight(pokemon.height)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold">
                    Weight
                  </th>
                  <td colSpan={2} className="py-2">
                    {formatWeight(pokemon.weight)}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2 align-top text-left font-semibold">
                    Abilities
                  </th>
                  <td colSpan={2} className="py-2">
                    {pokemon.abilities.map((a) => (
                      <div key={a.ability.name}>
                        {formatSlug(a.ability.name)}
                        {a.is_hidden && <span className="text-gray-500"> (hidden)</span>}
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          <Card title="Base Stats">
            <table className="w-full">
              <tbody>
                {pokemon.stats.map((s) => (
                  <tr key={s.stat.name}>
                    <th scope="row" className="py-2 pr-4 text-left font-semibold whitespace-nowrap">
                      {STAT_LABELS[s.stat.name] ?? formatSlug(s.stat.name)}
                    </th>
                    <td className="py-2 text-right">{s.base_stat}</td>
                    <td className="w-full py-2 pl-4">
                      <StatBar value={s.base_stat} max={MAX_STAT} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 dark:border-gray-800">
                  <th scope="row" className="py-2 text-left font-semibold">
                    Total
                  </th>
                  <td className="py-2 text-right font-semibold">{totalStats}</td>
                  <td className="w-full py-2 pl-4">
                    <StatBar value={totalStats} max={MAX_TOTAL} />
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>
        </div>

        {otherEntries.length > 0 && (
          <Card title="Other Forms">
            <div className="flex flex-wrap justify-center gap-6">
              {otherEntries.map((entry) => (
                <Link
                  key={entry.key}
                  href={`/pokemon/${species.name}?form=${entry.key}`}
                >
                  <figure className="flex flex-col items-center">
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`}
                      alt={entry.label}
                      width={128}
                      height={128}
                    />
                    <figcaption className="text-sm">{entry.label}</figcaption>
                  </figure>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
