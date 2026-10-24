import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  getSpecies,
  getPokemonForm,
  getPokemon,
  getIdFromUrl,
  getEnglishName,
  getGenus,
  getFormName,
} from "@/lib/pokeapi";
import { getArtworkUrl } from "@/lib/sprites";
import OverviewCard from "@/components/OverviewCard";
import StatsCard from "@/components/StatsCard";
import FormsCard from "@/components/FormsCard";

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
          <OverviewCard species={species} pokemon={pokemon} />
          <StatsCard stats={pokemon.stats} />
        </div>

        <FormsCard speciesName={species.name} entries={otherEntries} />
      </div>
    </div>
  );
}
