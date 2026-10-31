import {
  getPokemon,
  getPokemonForm,
  getFormName,
  getIdFromUrl,
  type Pokemon,
  type PokemonSpecies,
  getDefaultFormName,
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
  /** Variety name of the selected form, i.e. what ?form= holds. */
  selectedName: string;
  /** The other gender's variety, when the male/female switch applies. */
  genderCounterpart: string | null;
};

// Species whose extra forms are mostly cosmetic or in-game modes. For these, the
// Other Forms card offers only the default form plus the varieties listed here.
// Add species as you spot them.
const LIMITED_FORMS: Record<string, string[]> = {
  pikachu: ["pikachu-gmax"],
  eevee: ["eevee-gmax"],
  koraidon: [],
  miraidon: [],
};

// Species where the Other Forms card should show a specific set of forms for each
// selected form (for example Urshifu's two styles, each with its own Gigantamax).
const FORM_LINKS: Record<string, Record<string, string[]>> = {
  urshifu: {
    "urshifu-single-strike": ["urshifu-rapid-strike", "urshifu-single-strike-gmax"],
    "urshifu-rapid-strike": ["urshifu-single-strike", "urshifu-rapid-strike-gmax"],
    "urshifu-single-strike-gmax": ["urshifu-single-strike"],
    "urshifu-rapid-strike-gmax": ["urshifu-rapid-strike"],
  },
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

  const entries = forms.map((form, i) => {
    const variety = species.varieties[i];
    const label = getFormName(form, species);

    return {
      key: variety.pokemon.name,
      label: getGender(variety.pokemon.name) === null ? label: stripGender(label),
      id: getIdFromUrl(variety.pokemon.url),
    };
  });

  const selectedLabel = entries.find(
    (entry) => entry.key === selected.pokemon.name,
  )?.label;

  const selectedGender = getGender(selected.pokemon.name);
  const allowed = LIMITED_FORMS[species.name];
  const defaultName = getDefaultFormName(species);
  const links = FORM_LINKS[species.name]?.[selected.pokemon.name];
  const otherEntries = entries.filter(
    (entry) => {
      const gender = getGender(entry.key);
      return (
        entry.key !== selected.pokemon.name &&
        (gender === null || gender === selectedGender) &&
        (!allowed || entry.key === defaultName || allowed.includes(entry.key)) &&
        (!links || links.includes(entry.key))
      );
    }
  );

  return {
    pokemon,
    selectedId: getIdFromUrl(selected.pokemon.url),
    selectedLabel,
    otherEntries,
    selectedName: selected.pokemon.name,
    genderCounterpart: getGenderCounterpart(species, selected.pokemon.name),
  };
}

export function swapGender(varietyName: string): string | null {
  const parts = varietyName.split("-");
  if (!(parts.includes("male") || parts.includes("female"))) return null;
  return parts
    .map((p) => {
      if (p === "female") return "male";
      if (p === "male") return "female";
      return p;
    })
    .join("-");
}

export function isFemale(varietyName: string): boolean {
  return getGender(varietyName) === "female";
}

export function getGenderCounterpart(
  species: PokemonSpecies,
  selectedName: string,
): string | null {
  const swapped = swapGender(selectedName);
  if (!swapped) return null;

  return species.varieties.some((v) => v.pokemon.name === swapped) ? swapped : null;
}

function getGender(varietyName: string): "male" | "female" | null {
  const parts = varietyName.split("-");
  return parts.includes("female")
    ? "female"
    : parts.includes("male")
      ? "male"
      : null;
}

function stripGender(label: string): string {
  return label
    .split(" ")
    .filter(word => word !== "Male" && word !== "Female")
    .join(" ");
}
