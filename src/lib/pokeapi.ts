/** PokéAPI's standard shape for a link to another resource. */
type NamedResource = {
  name: string;
  url: string;
};

export type LocalizedName = {
  name: string;
  language: NamedResource;
};

export type SpeciesListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedResource[];
};

export type PokemonSpecies = {
  id: number;
  name: string;
  /** Eighths of this species that are female (0 to 8), or -1 if genderless. */
  gender_rate: number;
  /** 3 (hardest to catch) to 255 (easiest). */
  capture_rate: number;
  color: NamedResource;
  names: LocalizedName[];
  genera: { genus: string; language: NamedResource}[];
  varieties: { is_default: boolean; pokemon: NamedResource }[];
};

export type PokemonForm = {
  name: string;
  names: LocalizedName[];
};

export type Pokemon = {
  /** In decimetres (divide by 10 for metres). */
  height: number;
  /** In hectograms (divide by 10 for kilograms). */
  weight: number;
  types: { type: NamedResource }[];
  abilities: { is_hidden: boolean; ability: NamedResource }[];
  stats: { base_stat: number; stat: NamedResource }[];
};

// Pokémon data almost never changes, so cache every response for a day.
// This also keeps us polite towards PokéAPI, which asks for local caching.
const REVALIDATE_SECONDS = 60 * 60 * 24;

/**
 * Shared fetch for all PokéAPI endpoints. `T` is the response type the caller
 * expects; it isn't verified at runtime, so it must match the real API.
 */
async function fetchFromApi<T>(path: string): Promise<T> {
  const res = await fetch(`https://pokeapi.co/api/v2/${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) throw new Error(`PokéAPI request failed (${res.status}): ${path}`);
  return res.json();
}

export function getSpeciesList(limit: number, offset: number): Promise<SpeciesListResponse> {
  return fetchFromApi<SpeciesListResponse>(`pokemon-species?limit=${limit}&offset=${offset}`);
}

export function getSpecies(slug: number | string): Promise<PokemonSpecies> {
  return fetchFromApi<PokemonSpecies>(`pokemon-species/${slug}`);
}

export function getPokemonForm(name: string): Promise<PokemonForm> {
  return fetchFromApi<PokemonForm>(`pokemon-form/${name}`);
}

export function getPokemon(name: string): Promise<Pokemon> {
  return fetchFromApi<Pokemon>(`pokemon/${name}`);
}

/** Extracts the trailing ID from a PokéAPI URL, e.g. ".../pokemon/25/" -> 25. */
export function getIdFromUrl(url: string): number {
  const trimmedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  return Number(trimmedUrl.slice(trimmedUrl.lastIndexOf("/") + 1));
}

/** Picks the English entry by language code; array positions differ per resource. */
export function findEnglish(names: LocalizedName[]): string | undefined {
  return names.find((n) => n.language.name === "en")?.name;
}

export function getEnglishName(species: PokemonSpecies): string {
  return findEnglish(species.names) ?? species.name;
}

export function getGenus(species: PokemonSpecies): string | undefined {
  return species.genera.find((g) => g.language.name === "en")?.genus;
}

/**
 * Display name of a form. Default forms often have no English name of their
 * own (e.g. Charizard), so we fall back to the species' display name.
 */
export function getFormName(
  form: PokemonForm,
  species: PokemonSpecies,
): string {
  return findEnglish(form.names) ?? getEnglishName(species);
}

// Variety name endings that count as gender or regional forms (see
// getListedVarieties). The last two are special cases: Galarian Darmanitan
// and Paldean Tauros don't end in a plain region suffix.
const KEPT_SUFFIXES = [
  "-male",
  "-female",
  "-alola",
  "-galar",
  "-hisui",
  "-paldea",
  "-galar-standard", // Galarian Darmanitan
  "-breed",          // Paldean Tauros
];

/**
 * Which forms appear in the list rows: the default form, plus gender and
 * regional variants. Everything else (Megas, Gigantamax, Rotom appliances,
 * Origin/Therian, cosmetic forms) is shown on the detail page only.
 * Totem forms are excluded explicitly, since e.g. "raticate-totem-alola"
 * would otherwise match the "-alola" suffix.
 */
export function getListedVarieties(species: PokemonSpecies) {
  return species.varieties.filter(
    (v) =>
      !v.pokemon.name.includes("-totem") &&
      (v.is_default ||
        KEPT_SUFFIXES.some((suffix) => v.pokemon.name.endsWith(suffix))),
  );
}
