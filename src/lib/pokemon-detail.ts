import {
  getPokemon,
  getPokemonForm,
  getFormName,
  getIdFromUrl,
  type Pokemon,
  type PokemonSpecies,
} from "./pokeapi";

export type FormEntry = {
  /** The variety's slug, used in the ?form= URL parameter. */
  key: string;
  /** English display name, e.g. "Mega Charizard X". */
  label: string;
  /** Pokémon ID of this form, used for its artwork. */
  id: number;
};

export type PokemonDetail = {
  /** Data of the selected form (types, stats, ...). */
  pokemon: Pokemon;
  /** Pokémon ID of the selected form, for its artwork. */
  selectedId: number;
  /** Display name of the selected form, if it has one. */
  selectedLabel: string | undefined;
  /** The forms to offer in the Forms card: everything except the selected one. */
  otherEntries: FormEntry[];
};

/**
 * Everything the detail page needs beyond the species itself. `formParam` is
 * the raw ?form= value; unknown or missing values fall back to the default form.
 */
export async function getPokemonDetail(
  species: PokemonSpecies,
  formParam: string | undefined,
): Promise<PokemonDetail> {
  // Unknown or missing ?form= values fall back to the default form.
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

  // Male and female Mega Meowstic look identical, so show a label only once.
  const uniqueEntries = entries.filter(
    (entry, i) => entries.findIndex((e) => e.label === entry.label) === i,
  );

  const otherEntries = uniqueEntries.filter(
    (entry) => entry.key !== selected.pokemon.name,
  );

  return {
    pokemon,
    selectedId: getIdFromUrl(selected.pokemon.url),
    selectedLabel,
    otherEntries,
  };
}
