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
  getGenus,
} from "@/lib/pokeapi";
import {
  MAX_CAPTURE_RATE,
  getColorClass,
  formatHeight,
  formatWeight,
  formatSlug } from "@/lib/display";
  import { getArtworkUrl, getTypeIconUrl } from "@/lib/sprites";
import Card from "@/components/Card";
import StatBar from "@/components/StatBar";
import GenderBar from "@/components/GenderBar";
import StatsCard from "@/components/StatsCard";

export default async function PokemonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ form?: string }>;
}) {
  const { slug } = await params;
  const { form: formParam } = await searchParams;

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
    species.varieties.find((v) => v.pokemon.name === formParam) ??
    species.varieties.find((v) => v.is_default) ??
    species.varieties[0];
  
  const [pokemon, forms] = await Promise.all([
    getPokemon(selected.pokemon.name),
    Promise.all(species.varieties.map((v) => getPokemonForm(v.pokemon.name))),
  ]);

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
      <h1 className="text-center text-3xl font-bold pt-8">
        #{String(species.id).padStart(4, "0")} {getEnglishName(species)}
      </h1>
      <p className="pb-8 text-center text-lg text-gray-500">
        {getGenus(species)}
      </p>
      <Image
        src={getArtworkUrl(getIdFromUrl(selected.pokemon.url))}
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
                <col className="w-36" />
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
                        src={getTypeIconUrl(getIdFromUrl(t.type.url))}
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
                    {pokemon.abilities.map((a, i) => (
                      <span key={a.ability.name}>
                        {i > 0 && " | "}
                        <span
                          className={a.is_hidden ? "text-gray-500" : undefined}
                          title={a.is_hidden ? "Hidden ability" : undefined}
                        >
                          {formatSlug(a.ability.name)}
                        </span>
                      </span>
                    ))}
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold whitespace-nowrap">
                    Pokédex Color
                  </th>
                  <td colSpan={2} className="py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-4 w-4 rounded border border-gray-400 ${getColorClass(species.color.name)}`}
                        aria-hidden="true"
                      />
                      {formatSlug(species.color.name)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold whitespace-nowrap">
                    Capture Rate
                  </th>
                  <td colSpan={2} className="py-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8">{species.capture_rate}</span>
                      <div className="flex-1">
                        <StatBar value={species.capture_rate} max={MAX_CAPTURE_RATE} />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th scope="row" className="py-2 text-left font-semibold whitespace-nowrap">
                    Gender Ratio
                  </th>
                  <td colSpan={2} className="py-2">
                    <GenderBar genderRate={species.gender_rate} />
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          <StatsCard stats={pokemon.stats} />
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
                      src={getArtworkUrl(entry.id)}
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
