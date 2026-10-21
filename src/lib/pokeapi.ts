export type PokemonListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export type SpeciesListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export type PokemonSpecies = {
  id: number;
  name: string;
  names: {
    name: string;
    language: {
      name: string;
    };
  }[];
  varieties: {
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    };
  }[];
};

export async function getPokemonList(
  limit: number,
  offset: number,
): Promise<PokemonListResponse> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 60 * 60 * 24 } },
  );
  
  if (!res.ok) {
    throw new Error("Error fetching Pokémon.");
  }

  return res.json();
}

export async function getSpeciesList(
  limit: number,
  offset: number,
): Promise<SpeciesListResponse> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 60 * 60 * 24 } },
  );

  if (!res.ok) {
    throw new Error("Error fetching Pokémon species.");
  }

  return res.json();
}

export async function getSpecies(slug: number | string): Promise<PokemonSpecies> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${slug}`,
    { next: { revalidate: 60 * 60 * 24 } },
  );

  if (!res.ok) {
    throw new Error(`Error fetching Pokémon species: ${slug}`);
  }

  return res.json();
}

export function getPokemonId(url: string): number {
  const trimmedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  return Number(trimmedUrl.slice(trimmedUrl.lastIndexOf("/") + 1));
}

export function getEnglishName(species: PokemonSpecies): string {
  return species.names.find((n) => n.language.name === "en")?.name ?? species.name;
}

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

export function getListedVarieties(species: PokemonSpecies) {
  return species.varieties.filter(
    (v) =>
      !v.pokemon.name.includes("-totem") &&
      (v.is_default ||
        KEPT_SUFFIXES.some((suffix) => v.pokemon.name.endsWith(suffix))),
  );
}
