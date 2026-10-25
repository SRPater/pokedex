// Detail page for /pokemon/[slug]. The slug is a species name (an ID also works
// and redirects to the name). ?form=<variety> picks which form's data every
// card shows; missing or unknown values mean the default form.
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { getSpecies, PokeApiError, getEnglishName, getGenus } from "@/lib/pokeapi";
import { getPokemonDetail } from "@/lib/pokemon-detail";
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
  // In current Next.js, params and searchParams are Promises.
  const { slug } = await params;
  const { form: formParam } = await searchParams;

  let species;
  try {
    species = await getSpecies(slug);
  } catch (error) {
    // Only a 404 from PokéAPI means "no such Pokémon"; anything else is a failure.
    if (error instanceof PokeApiError && error.status === 404) notFound();
    throw error;
  }

  if (slug !== species.name) {
    // One canonical URL per Pokémon: /pokemon/25 redirects to /pokemon/pikachu.
    redirect(`/pokemon/${species.name}`);
  }

  const { pokemon, selectedId, selectedLabel, otherEntries } =
    await getPokemonDetail(species, formParam);

  return (
    <div className="w-full max-w-5xl mx-auto px-8 pb-8">
      <h1 className="text-center text-3xl font-bold pt-8">
        #{String(species.id).padStart(4, "0")} {getEnglishName(species)}
      </h1>
      <p className="pb-8 text-center text-lg text-gray-500">
        {getGenus(species)}
      </p>
      <Image
        src={getArtworkUrl(selectedId)}
        alt={getEnglishName(species)}
        width={256}
        height={256}
        className="mx-auto"
      />
      {/* Name the shown form, but only when it adds something beyond the heading.*/}
      {selectedLabel && selectedLabel !== getEnglishName(species) && (
        <p className="mt-2 text-center text-gray-500">{selectedLabel}</p>
      )}
      <div className="mt-8 flex flex-col gap-6">
        {/* Overview and Stats sit side by side from the md breakpoint up, stacked below. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <OverviewCard species={species} pokemon={pokemon} />
          <StatsCard stats={pokemon.stats} />
        </div>

        <FormsCard speciesName={species.name} entries={otherEntries} />
      </div>
    </div>
  );
}
