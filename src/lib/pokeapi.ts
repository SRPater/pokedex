const KEPT_SUFFIXES = [
  "-male",
  "-female",
  "-alola",
  "-galar",
  "-hisui",
  "-paldea",
  "-galar-standard", // Galarian Darmanitan
  "-breed", // Paldean Tauros
];

export type LocalizedName = {
  name: string;
  language: {
    name: string;
  };
};

export type SpeciesListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
};

export type PokemonSpecies = {
  id: number;
  name: string;
  names: LocalizedName[];
  varieties: {
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    };
  }[];
};

export type PokemonForm = {
  name: string;
  names: LocalizedName[];
  form_names: LocalizedName[];
};

export type Pokemon = {
  name: string;
  height: number;
  weight: number;
  types: {
    type: {
      name: string;
      url: string;
    };
  }[];
  abilities: {
    is_hidden: boolean;
    ability: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
};

export async function getSpeciesList(
  limit: number,
  offset: number,
): Promise<SpeciesListResponse> {
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species?limit=${limit}&offset=${offset}`,
    { next: { revalidate: 60 * 60 * 24 } },
  );

  if (!res.ok) throw new Error("Error fetching Pokémon species.");
  return res.json();
}

export async function getSpecies(
  slug: number | string,
): Promise<PokemonSpecies> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${slug}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) throw new Error(`Error fetching Pokémon species: ${slug}.`);
  return res.json();
}

export async function getPokemonForm(name: string): Promise<PokemonForm> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-form/${name}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) throw new Error(`Error fetching Pokémon form: ${name}.`);
  return res.json();
}

export async function getPokemon(name: string): Promise<Pokemon> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) throw new Error(`Error fetching Pokémon: ${name}.`);
  return res.json();
}

export function getIdFromUrl(url: string): number {
  const trimmedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
  return Number(trimmedUrl.slice(trimmedUrl.lastIndexOf("/") + 1));
}

export function findEnglish(names: LocalizedName[]): string | undefined {
  return names.find((n) => n.language.name === "en")?.name;
}

export function getEnglishName(species: PokemonSpecies): string {
  return findEnglish(species.names) ?? species.name;
}

export function getFormName(
  form: PokemonForm,
  species: PokemonSpecies,
): string {
  return findEnglish(form.names) ?? getEnglishName(species);
}

export function getListedVarieties(species: PokemonSpecies) {
  return species.varieties.filter(
    (v) =>
      !v.pokemon.name.includes("-totem") &&
      (v.is_default ||
        KEPT_SUFFIXES.some((suffix) => v.pokemon.name.endsWith(suffix))),
  );
}
