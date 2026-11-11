// Detail page for /pokemon/[slug]. The slug is a species name (an ID also works
// and redirects to the name). ?form=, ?region= and ?gender= pick the variety
// whose data every card shows; a missing parameter means "same as the default
// variety", and a combination that doesn't exist redirects to the plain page.
import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import {
  getDefaultFormName,
  getEnglishName,
  getGenus,
  getNeighbours,
  getSpecies,
  PokeApiError,
} from "@/lib/pokeapi";
import { getPokemonDetail } from "@/lib/pokemon-detail";
import { getRenderUrl } from "@/lib/sprites";
import {
  buildVarietyQuery,
  findVariety,
  hasGenderVarieties,
  isFemale,
} from "@/lib/variety";

import CryButton from "@/components/CryButton";
import DetailHeader from "@/components/DetailHeader";
import FormsCard from "@/components/FormsCard";
import GenderSwitch from "@/components/GenderSwitch";
import OverviewCard from "@/components/OverviewCard";
import ShinyToggle from "@/components/ShinyToggle";
import StatsCard from "@/components/StatsCard";

// Tab title for /pokemon/[slug], e.g. "Charizard | Pokédex" (the " | Pokédex"
// comes from the template in the root layout).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const species = await getSpecies(slug);
    return { title: getEnglishName(species) };
  } catch {
    // Unknown slug or API failure: keep the default title. The page itself
    // decides between the 404 and the error page.
    return {};
  }
}

export default async function PokemonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    form?: string;
    region?: string;
    gender?: string;
    shiny?: string;
  }>;
}) {
  // In current Next.js, params and searchParams are Promises.
  const { slug } = await params;
  const { form, region, gender, shiny: shinyParam } = await searchParams;
  // ?shiny=true shows the shiny pictures; anything else (or nothing) is the normal one.
  const shiny = shinyParam === "true";

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

  // For species without gender varieties, ?gender= only picks the picture (see below).
  const variety = findVariety(species, {
    form,
    region,
    gender: hasGenderVarieties(species) ? gender : undefined,
  });

  // A combination that doesn't exist (e.g. ?form=nonsense) goes to the plain page.
  if (!variety) redirect(`/pokemon/${species.name}`);

  const selectedName = variety.pokemon.name;
  const selectedIsFemale = isFemale(selectedName);

  // Adds ?shiny=true to a link when shiny is on, so switching gender or form keeps it.
  // The href may or may not have a query already, hence the check for "?".
  const keepShiny = (href: string) =>
    shiny ? `${href}${href.includes("?") ? "&" : "?"}shiny=true` : href;

  const hrefFor = (name: string) =>
    keepShiny(`/pokemon/${species.name}${buildVarietyQuery(species, name)}`);

  // The toggle's target: same page and same variety parameters, with shiny flipped.
  // Built from the incoming parameters so a selected form/region/gender survives.
  const toggleParams = new URLSearchParams();
  if (form) toggleParams.set("form", form);
  if (region) toggleParams.set("region", region);
  if (gender) toggleParams.set("gender", gender);
  // Shiny is only written when turning it on; the normal page has no ?shiny.
  if (!shiny) toggleParams.set("shiny", "true");
  const toggleQuery = toggleParams.toString();
  const shinyHref = `/pokemon/${species.name}${toggleQuery ? `?${toggleQuery}` : ""}`;

  const [
    { pokemon, selectedId, selectedLabel, otherEntries, genderCounterpart },
    { previous, next },
  ] = await Promise.all([
    getPokemonDetail(species, variety),
    getNeighbours(species),
  ]);

  // Species whose female only looks different (no variety of her own, e.g. Pikachu).
  // Only the default form has a female picture.
  const pictureOnly =
    species.has_gender_differences &&
    !genderCounterpart &&
    selectedName === getDefaultFormName(species);
  const showFemale = pictureOnly && gender === "female";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-8">
      <DetailHeader previous={previous} next={next}>
        <h1 className="text-center text-3xl font-bold">
          #{String(species.id).padStart(4, "0")} {getEnglishName(species)}
        </h1>
        <p className="text-center text-lg text-gray-500">{getGenus(species)}</p>
      </DetailHeader>

      {/* The wrapper is exactly as wide as the image (w-64 = 256px) and centered, so the
          image stays centered on the page. The toggle sits outside its right edge
          (left-full) and is centered vertically, so it doesn't affect the layout. */}
      <div className="relative mx-auto w-64">
        <Image
          src={getRenderUrl(selectedId, { female: showFemale, shiny })}
          alt={getEnglishName(species)}
          width={256}
          height={256}
          // Above the fold and the largest element, so don't lazy-load it.
          loading="eager"
        />
        <div className="absolute left-full top-1/2 ml-4 -translate-y-1/2">
          <ShinyToggle shiny={shiny} href={shinyHref} />
        </div>
      </div>

      {/* Some form may have no cry (the field is nullable), so only show the button when there is one. */ }
      {pokemon.cries.latest && (
        <div className="mt-4 flex justify-center">
          <CryButton src={pokemon.cries.latest} />
        </div>
      )}

      {genderCounterpart && (
        <GenderSwitch
          selected={selectedIsFemale ? "female" : "male"}
          maleHref={hrefFor(
            selectedIsFemale ? genderCounterpart : selectedName,
          )}
          femaleHref={hrefFor(
            selectedIsFemale ? selectedName : genderCounterpart,
          )}
        />
      )}

      {pictureOnly && (
        <GenderSwitch
          selected={showFemale ? "female" : "male"}
          maleHref={keepShiny(`/pokemon/${species.name}`)}
          femaleHref={keepShiny(`/pokemon/${species.name}?gender=female`)}
        />
      )}

      {/* Name the shown form, but only when it adds something beyond the heading. */}
      {selectedLabel && selectedLabel !== getEnglishName(species) && (
        <p className="mt-2 text-center text-gray-500">{selectedLabel}</p>
      )}
      <div className="mt-8 flex flex-col gap-6">
        {/* Overview and Stats sit side by side from the md breakpoint up, stacked below. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <OverviewCard species={species} pokemon={pokemon} />
          <StatsCard stats={pokemon.stats} />
        </div>

        {/* The entries' hrefs are built in getPokemonDetail, which doesn't know about
            shiny, so add it here. */}
        <FormsCard
          entries={otherEntries.map((entry) => ({
            ...entry,
            href: keepShiny(entry.href),
          }))}
          shiny={shiny}
        />
      </div>
    </div>
  );
}
