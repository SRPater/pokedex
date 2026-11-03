import { getDefaultVariety, type PokemonSpecies } from "./pokeapi";

// Words in a variety name that mark a regional form (raichu-alola, meowth-galar).
const REGIONS = ["alola", "galar", "hisui", "paldea"];

/** What a variety name says about itself; each is null when the name has no such word. */
type VarietyParts = {
  form: string | null;
  region: string | null;
  gender: "male" | "female" | null;
};

/** The same three values as they come from the URL; a missing one means "same as the default". */
type VarietyQuery = { form?: string; region?: string; gender?: string };

function genderOf(parts: string[]): "male" | "female" | null {
  return parts.includes("female")
    ? "female"
    : parts.includes("male")
      ? "male"
      : null;
}

/** The gender word in a variety name, or null. */
export function getGender(varietyName: string): "male" | "female" | null {
  return genderOf(varietyName.split("-"));
}

/** True for the female variety of a gendered species. */
export function isFemale(varietyName: string): boolean {
  return getGender(varietyName) === "female";
}

/**
 * The same variety name with male and female swapped ("meowstic-male" ->
 * "meowstic-female"), or null when the name has no gender.
 */
export function swapGender(varietyName: string): string | null {
  const parts = varietyName.split("-");
  if (genderOf(parts) === null) return null;
  return parts
    .map((p) => (p === "male" ? "female" : p === "female" ? "male" : p))
    .join("-");
}

/** Removes the words "Male" and "Female" from a form label ("Female Meowstic" -> "Meowstic"). */
export function stripGender(label: string): string {
  return label
    .split(" ")
    .filter((word) => word !== "Male" && word !== "Female")
    .join(" ");
}

/**
 * Splits a variety name into the three things the URL can say about it:
 * `form` (mega-x, gmax, zen, ...), `region` (alola, galar, hisui, paldea) and
 * `gender` (male, female). The species name is removed first, then the remaining
 * hyphen-separated words are sorted into the three buckets; each is null when the
 * name has no such word. Assumes variety names start with the species name.
 */
export function parseVariety(
  speciesName: string,
  varietyName: string,
): VarietyParts {
  const rest =
    varietyName === speciesName
      ? ""
      : varietyName.startsWith(speciesName + "-")
        ? varietyName.slice(speciesName.length + 1)
        : varietyName;

  let parts = rest === "" ? [] : rest.split("-");
  const gender = genderOf(parts);
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
  wanted: VarietyQuery,
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

/**
 * The query string for a link to `varietyName`, e.g. "?form=mega&gender=female".
 * Values that equal the default variety's are left out, so the default itself
 * gives "". The inverse of findVariety.
 *
 * Limitation: a variety with no form (or region, or gender) of its own can't be
 * reached when the default has one. I don't know of a species where this happens.
 */
export function buildVarietyQuery(
  species: PokemonSpecies,
  varietyName: string,
): string {
  const wanted = parseVariety(species.name, varietyName);
  const defaultVariety = getDefaultVariety(species);
  const base = parseVariety(species.name, defaultVariety.pokemon.name);
  const params = new URLSearchParams();

  if (wanted.form && wanted.form !== base.form) params.set("form", wanted.form);
  if (wanted.region && wanted.region !== base.region)
    params.set("region", wanted.region);
  if (wanted.gender && wanted.gender !== base.gender)
    params.set("gender", wanted.gender);

  return params.toString() === "" ? "" : `?${params.toString()}`;
}

/** True for species with separate male and female varieties (Meowstic, Indeedee, ...). */
export function hasGenderVarieties(species: PokemonSpecies): boolean {
  return species.varieties.some(
    (v) => parseVariety(species.name, v.pokemon.name).gender !== null,
  );
}
