import { PokemonSpecies } from "./pokeapi";

const REGIONS = ["alola", "galar", "hisui", "paldea"];

export function parseVariety(
  speciesName: string,
  varietyName: string,
): {
  form: string | null;
  region: string | null;
  gender: "male" | "female" | null;
} {
  const rest = varietyName === speciesName
    ? ""
    : varietyName.startsWith(speciesName + "-")
      ? varietyName.slice(speciesName.length + 1)
      : varietyName;
  
  let parts = rest === "" ? [] : rest.split("-");
  const gender = parts.includes("female")
    ? "female"
    : parts.includes("male")
      ? "male"
      : null;

  parts = parts.filter((part) => part !== gender);
  const region = parts.find((p) => REGIONS.includes(p)) ?? null;
  parts = parts.filter((part) => part !== region);
  const form = parts.length === 0 ? null : parts.join("-");

  return {
    form,
    region,
    gender,
  };
}

/**
 * Finds the variety that matches the form, region and gender from the URL.
 * An axis that the URL leaves out means "same as the default variety", so
 * ?form=mega on Meowstic finds the male Mega. Returns undefined when no
 * variety matches (e.g. a female Charizard).
 */
export function findVariety(
  species: PokemonSpecies,
  wanted: { form?: string; region?: string; gender?: string },
): PokemonSpecies["varieties"][number] | undefined {
  // Describe every variety by its form, region and gender.
  const entries = species.varieties.map((variety) => ({
    variety,
    ...parseVariety(species.name, variety.pokemon.name),
  }));

  // The default variety is the starting point for anything the URL leaves out.
  const base = entries.find((e) => e.variety.is_default) ?? entries[0];

  // An axis missing from the URL means "same as the default".
  const form = wanted.form ?? base.form;
  const region = wanted.region ?? base.region;
  const gender = wanted.gender ?? base.gender;

  // The variety that matches all three, or undefined if there isn't one.
  return entries.find(
    (e) => e.form === form && e.region === region && e.gender === gender,
  )?.variety;
}

export function buildVarietyQuery(
  species: PokemonSpecies,
  varietyName: string,
): string {
  const wanted = parseVariety(species.name, varietyName);
  const defaultVariety = species.varieties.find((v) => v.is_default) ?? species.varieties[0];
  const base = parseVariety(species.name, defaultVariety.pokemon.name);
  const params = new URLSearchParams();

  if (wanted.form && wanted.form !== base.form) params.set("form", wanted.form);
  if (wanted.region && wanted.region !== base.region) params.set("region", wanted.region);
  if (wanted.gender && wanted.gender !== base.gender) params.set("gender", wanted.gender);

  return params.toString() === "" ? "" : `?${params.toString()}`;
}

export function hasGenderVarieties(species: PokemonSpecies): boolean {
  return species.varieties.some(
    (v) => parseVariety(species.name, v.pokemon.name).gender !== null
  );
}
