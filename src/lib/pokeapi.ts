/** PokéAPI's standard shape for a link to another resource. */
type NamedResource = {
  name: string;
  url: string;
};

type LocalizedName = {
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
  /** True when males and females look different (the female sprite then exists). */
  has_gender_differences: boolean;
  /** 3 (hardest to catch) to 255 (easiest). */
  capture_rate: number;
  /** Link to the evolution chain this species belongs to (shared by the whole family). */
  evolution_chain: { url: string };
  color: NamedResource;
  names: LocalizedName[];
  genera: { genus: string; language: NamedResource }[];
  varieties: { is_default: boolean; pokemon: NamedResource }[];
};

export type PokemonForm = {
  name: string;
  names: LocalizedName[];
};

/** An item as the evolution labels need it: its API name and its names per language. */
export type Item = {
  name: string;
  names: LocalizedName[];
};

/** A move as the evolution label needs it: its API name and its names per language. */
export type Move = {
  name: string;
  names: LocalizedName[];
};

/** A location as the evolution labels need it: its API name and its names per language. */
export type Location = {
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
  /**
   * Links to the cry audio (.ogg). `latest` is the current cry; `legacy` is the
   * older one and is null for many Pokémon, so we only use `latest`. Typed as
   * nullable in case a form has no cry at all.
   */
  cries: { latest: string | null; legacy: string | null };
};

type PokemonTypeData = {
  id: number;
  name: string;
  pokemon: { slot: number; pokemon: NamedResource }[];
  // Only the "_from" lists: a Pokémon's weaknesses and resistances depend on what hits it.
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
};

/**
 * One way a stage can evolve. A stage can have several entries: one per game where
 * the rules changed (Leafeon has six), or alternatives such as a regional form
 * (Raichu). The API sends about 30 fields per entry and uses `null` for "doesn't
 * apply", so we only list the fields we use so far and add the rest when we write
 * the labels.
 */
export type EvolutionDetail = {
  /** Picks the current rule when a stage has one entry per game (Leafeon: one `true`). */
  is_default: boolean;
  /** The form of the previous stage that evolves, e.g. "vulpix-alola"; `null` means the default form. */
  required_pokemon_form: NamedResource | null;
  /** The form that comes out, e.g. "raichu-alola"; `null` means the default form. */
  evolved_pokemon_form: NamedResource | null;
  /** What kind of evolution this is: "level-up", "use-item", "trade", ... (18 in all). */
  trigger: NamedResource;
  /** The item to use, for the "use-item" trigger. */
  item: NamedResource | null;
  /** The item the Pokémon has to hold (Kingdra: Dragon Scale), apart from one it is used with. */
  held_item: NamedResource | null;
  /** The level to reach (Charmeleon: 16). */
  min_level: number | null;
  /** The friendship needed (Espeon: 160). */
  min_happiness: number | null;
  /** "day", "night" or "dusk"; an empty string, not null, when the time doesn't matter. */
  time_of_day: string;
  /** The damage to take before evolving (Runerigus: 49); for "take-damage" and "recoil-damage". */
  min_damage_taken: number | null;
  /** The number of steps to walk before evolving. */
  min_steps: number | null;
  /** 1 for female, 2 for male; null when the gender doesn't matter (Kirlia -> Gallade: 2). */
  gender: 1 | 2 | null;
  /** The move the Pokémon has to know (Mamoswine: Ancient Power). */
  known_move: NamedResource | null;
  /** The type of a move it has to know, whichever move it is (Sylveon: fairy). */
  known_move_type: NamedResource | null;
  /** The move to use, for the move triggers (Annihilape: Rage Fist). */
  used_move: NamedResource | null;
  /** How many times `used_move` has to be used (20). */
  min_move_count: 20 | null;
  /** 1 when Attack is higher than Defense, -1 when lower, 0 when equal (Tyrogue). */
  relative_physical_stats: 1 | 0 | -1 | null;
  /** True when it has to be raining (Goodra). */
  needs_overworld_rain: boolean;
  /** True when the console has to be held upside down (Malamar). */
  turn_upside_down: boolean;
  /** True when another player has to be connected (Finizen -> Palafin, in an Union Circle). */
  needs_multiplayer: boolean;
  /** The region the evolution has to happen in (Alolan Raichu: "alola"). */
  region: NamedResource | null;
  /** The type of a Pokémon that has to be in the party (Pangoro: dark). */
  party_type: NamedResource | null;
  /** The species it has to be traded for (Karrablast: Shelmet). */
  trade_species: NamedResource | null;
  /** The species that has to be in the party (Mantyke: Remoraid). */
  party_species: NamedResource | null;
  /** The place it has to happen in (Runerigus: Dusty Bowl). */
  location: NamedResource | null;
  /** The natures that can evolve (Toxel -> Toxtricity: 13 for Amped, 12 for Low Key). */
  allowed_natures: NamedResource[] | null;
  /**
   * Extra rules the other fields can't say. The API also has the formula itself, but
   * we only use the chance: Wurmple's Silcoon and Cascoon are 50% each, Maushold's two
   * forms 99% and 1%. `null` chance for Alcremie's spin, whose formula we don't show.
   */
  condition_expression: { percentage_chance: number | null } | null;
};

/**
 * One stage of an evolution chain. `evolves_to` holds the next stages, so the chain
 * is a tree (Eevee has 8 branches), not a line. `evolution_details` says how this
 * stage is reached from the one before it, and is empty for the first stage.
 */
export type ChainLink = {
  species: NamedResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
};

type EvolutionChain = {
  id: number;
  chain: ChainLink;
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

/** One page of the species list (names and URLs only), in Pokédex order. */
export function getSpeciesList(
  limit: number,
  offset: number,
): Promise<SpeciesListResponse> {
  return fetchFromApi<SpeciesListResponse>(
    `pokemon-species?limit=${limit}&offset=${offset}`,
  );
}

/** Every species (name and URL only) in Pokédex order; used for searching. */
export async function getAllSpeciesNames(): Promise<
  SpeciesListResponse["results"]
> {
  // The API has no search endpoint, so we fetch the whole list (1025 entries, one
  // cached request) and filter it ourselves. The limit just has to be above the count.
  const { results } = await getSpeciesList(2000, 0);
  return results;
}

/** A species by name ("meowstic") or Pokédex number (678). */
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
  // One entry is enough: we only need the total count.
  const { count } = await getSpeciesList(1, 0);
  const previousId = species.id === 1 ? count : species.id - 1;
  const nextId = species.id === count ? 1 : species.id + 1;

  const [previous, next] = await Promise.all([
    getSpecies(previousId),
    getSpecies(nextId),
  ]);

  return { previous, next };
}

/** The form with this name, or null if there is none (variety and form names don't always match). */
export async function getPokemonForm(
  name: string,
): Promise<PokemonForm | null> {
  try {
    return await fetchFromApi<PokemonForm>(`pokemon-form/${name}`);
  } catch (error) {
    // A variety's form can have a different name (e.g. "koraidon" has the
    // form "koraidon-apex-build"), so a 404 here just means "no form of that name".
    if (error instanceof PokeApiError && error.status === 404) return null;
    throw error;
  }
}

/** One variety's own data (types, stats, abilities, size), e.g. "charizard-mega-x". */
export function getPokemon(name: string): Promise<Pokemon> {
  return fetchFromApi<Pokemon>(`pokemon/${name}`);
}

/** An evolution chain by ID; the ID is in the species' `evolution_chain.url`. */
export function getEvolutionChain(id: number): Promise<EvolutionChain> {
  return fetchFromApi<EvolutionChain>(`evolution-chain/${id}`);
}

/** An item by name ("thunder-stone"), as it appears in an evolution entry's `item.name`. */
export function getItem(name: string): Promise<Item> {
  return fetchFromApi<Item>(`item/${name}`);
}

/** A move by name ("ancient-power"), as it appears in the evolution entry's `known_move` or `used_move`. */
export function getMove(name: string): Promise<Move> {
  return fetchFromApi<Move>(`move/${name}`);
}

/** A location by name ("dusty-bowl"), as it appears in an evolution entry's `location.name`. */
export function getLocation(name: string): Promise<Location> {
  return fetchFromApi<Location>(`location/${name}`);
}

/** A type and every Pokémon form that has it; used to build the type lookup. */
function getType(name: string): Promise<PokemonTypeData> {
  return fetchFromApi<PokemonTypeData>(`type/${name}`);
}

/** The attacking types a type takes double, half or no damage from, as plain names. */
export type DamageFrom = {
  double: string[];
  half: string[];
  none: string[];
};

export async function getDamageFrom(name: string): Promise<DamageFrom> {
  // Same URL as getTypeLookup uses, so this comes from the cache, not a new request.
  const { damage_relations } = await getType(name);
  // We only need the names; the URLs in NamedResource are of no use here.
  const names = (list: NamedResource[]) => list.map((t) => t.name);

  return {
    double: names(damage_relations.double_damage_from),
    half: names(damage_relations.half_damage_from),
    none: names(damage_relations.no_damage_from),
  };
}

/** Extracts the trailing ID from a PokéAPI URL, e.g. ".../pokemon/25/" -> 25. */
export function getIdFromUrl(url: string): number {
  const trimmedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  return Number(trimmedUrl.slice(trimmedUrl.lastIndexOf("/") + 1));
}

/** Picks the English entry by language code; array positions differ per resource. */
function findEnglish(names: LocalizedName[]): string | undefined {
  return names.find((n) => n.language.name === "en")?.name;
}

/** English display name of a species, e.g. "Mr. Mime"; falls back to the slug. */
export function getEnglishName(species: PokemonSpecies): string {
  return findEnglish(species.names) ?? species.name;
}

/** The species' category in English, e.g. "Flame Pokémon". */
export function getGenus(species: PokemonSpecies): string | undefined {
  return species.genera.find((g) => g.language.name === "en")?.genus;
}

/**
 * Display name of a form. Default forms often have no English name of their
 * own (e.g. Charizard), so we fall back to the species' display name.
 */
export function getFormName(
  form: PokemonForm | null,
  species: PokemonSpecies,
): string {
  return findEnglish(form?.names ?? []) ?? getEnglishName(species);
}

/** English display name of an item, e.g. "Thunder Stone"; falls back to the API's name. */
export function getItemName(item: Item): string {
  return findEnglish(item.names) ?? item.name;
}

/** English display name of a move, e.g. "Acient Power"; falls back to the API's name. */
export function getMoveName(move: Move): string {
  return findEnglish(move.names) ?? move.name;
}

/** English display name of a location, e.g. "Dusty Bowl"; falls back to the API's name. */
export function getLocationName(location: Location): string {
  return findEnglish(location.names) ?? location.name;
}

/** The species' default variety (the one marked is_default, or the first if none is). */
export function getDefaultVariety(
  species: PokemonSpecies,
): PokemonSpecies["varieties"][number] {
  return species.varieties.find((v) => v.is_default) ?? species.varieties[0];
}

/** Name of the species' default form, e.g. "meowstic-male" for Meowstic. */
export function getDefaultFormName(species: PokemonSpecies): string {
  return getDefaultVariety(species).pokemon.name;
}

// The 18 regular types. Stellar, unknown and shadow are left out on purpose:
// they aren't types of ordinary Pokémon.
const TYPE_NAMES = [
  "normal",
  "fighting",
  "flying",
  "poison",
  "ground",
  "rock",
  "bug",
  "ghost",
  "steel",
  "fire",
  "water",
  "grass",
  "electric",
  "psychic",
  "ice",
  "dragon",
  "dark",
  "fairy",
];

/**
 * A type's ID, which its icon URL needs. The ID is the position in TYPE_NAMES plus
 * one, because the list follows PokéAPI's own order (normal is 1, fairy is 18). If
 * PokéAPI adds a regular type, add it to TYPE_NAMES too.
 */
export function getTypeId(name: string): number {
  const index = TYPE_NAMES.indexOf(name);
  // Fail loudly: without this an unknown name would give ID 0 and a broken icon with no clue why.
  if (index === -1) throw new Error(`Unknown Pokémon type: "${name}"`);
  return index + 1;
}

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
