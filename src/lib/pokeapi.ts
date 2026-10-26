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

export type PokemonTypeData = {
  id: number;
  name: string;
  pokemon: { slot: number; pokemon: NamedResource }[];
};

/** One type of a Pokémon, with the ID that its icon URL needs. */
export type PokemonTypeInfo = {
  name: string;
  id: number;
};

// Pokémon data almost never changes, so cache every response for a day.
// This also keeps us polite towards PokéAPI, which asks for local caching.
const REVALIDATE_SECONDS = 60 * 60 * 24;

/** Thrown for any non-OK PokéAPI response; `status` is the HTTP status code. */
export class PokeApiError extends Error {
  status: number;

  constructor(status: number, path: string) {
    super(`PokéAPI request failed (${status}): ${path}`);
    this.name = "PokeApiError";
    this.status = status;
  }
}

/**
 * Shared fetch for all PokéAPI endpoints. `T` is the response type the caller
 * expects; it isn't verified at runtime, so it must match the real API.
 */
async function fetchFromApi<T>(path: string): Promise<T> {
  const res = await fetch(`https://pokeapi.co/api/v2/${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) throw new PokeApiError(res.status, path);
  return res.json();
}

export function getSpeciesList(limit: number, offset: number): Promise<SpeciesListResponse> {
  return fetchFromApi<SpeciesListResponse>(`pokemon-species?limit=${limit}&offset=${offset}`);
}

export function getSpecies(slug: number | string): Promise<PokemonSpecies> {
  return fetchFromApi<PokemonSpecies>(`pokemon-species/${slug}`);
}

/**
 * The species before and after `species` in Pokédex order, wrapping around:
 * the one before #1 is the last species, and the one after the last is #1.
 */
export async function getNeighbours(
  species: PokemonSpecies,
): Promise<{ previous: PokemonSpecies; next: PokemonSpecies }> {
  const { count } = (await getSpeciesList(1, 0));
  const previousId = species.id === 1 ? count : species.id - 1;
  const nextId = species.id === count ? 1 : species.id + 1;

  const [previous, next] = await Promise.all([
    getSpecies(previousId),
    getSpecies(nextId),
  ]);

  return { previous, next };
}

export function getPokemonForm(name: string): Promise<PokemonForm> {
  return fetchFromApi<PokemonForm>(`pokemon-form/${name}`);
}

export function getPokemon(name: string): Promise<Pokemon> {
  return fetchFromApi<Pokemon>(`pokemon/${name}`);
}

export function getType(name: string): Promise<PokemonTypeData> {
  return fetchFromApi<PokemonTypeData>(`type/${name}`);
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

// The 18 regular types. Stellar, unknown an shadow are left out on purpose:
// they aren't types of ordinary Pokémon.
const TYPE_NAMES = [
  "normal", "fighting", "flying", "poison", "ground", "rock",
  "bug", "ghost", "steel", "fire", "water", "grass",
  "electric", "psychic", "ice", "dragon", "dark", "fairy",
];

/** Maps a Pokémon (or form) name to its types, primary type first. */
export async function getTypeLookup(): Promise<Map<string, PokemonTypeInfo[]>> {
  // Fetch all 18 types at the same time.
  const types = await Promise.all(TYPE_NAMES.map((name) => getType(name)));

  // Put each type at the position its slot says (slot 1 -> index 0, slot 2 -> index 1),
  // so every list ends up with the primary type first, whatever order we meet them in.
  const lookup = new Map<string, PokemonTypeInfo[]>();
  for (const type of types) {
    for (const entry of type.pokemon) {
      const list = lookup.get(entry.pokemon.name) ?? [];
      list[entry.slot - 1] = { name: type.name, id: type.id };
      lookup.set(entry.pokemon.name, list);
    }
  }

  return lookup;
}
