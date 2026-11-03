import {
  getDefaultFormName,
  getFormName,
  getIdFromUrl,
  getPokemon,
  getPokemonForm,
  type PokemonForm,
  type Pokemon,
  type PokemonSpecies,
} from "./pokeapi";
import {
  buildVarietyQuery,
  getGender,
  stripGender,
  swapGender,
} from "./variety";

export type FormEntry = {
  /** The variety's name, e.g. "charizard-mega-x". Identifies the entry; the filters work on it. */
  key: string;
  /** English display name, e.g. "Mega Charizard X". */
  label: string;
  /** Pokémon ID of this form, used for its artwork. */
  id: number;
  /** Link to this form's page, with the form, region and gender in the query. */
  href: string;
};

export type PokemonDetail = {
  /** Data of the selected form (types, stats, ...). */
  pokemon: Pokemon;
  /** Pokémon ID of the selected form, for its artwork. */
  selectedId: number;
  /** Display name of the selected form, if it has one. */
  selectedLabel: string;
  /** The forms to offer in the Forms card: everything except the selected one. */
  otherEntries: FormEntry[];
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
// selected form (Urshifu, Darmanitan and Toxtricity: two base looks, each with its
// own Gigantamax or Zen form).
const FORM_LINKS: Record<string, Record<string, string[]>> = {
  urshifu: {
    "urshifu-single-strike": [
      "urshifu-rapid-strike",
      "urshifu-single-strike-gmax",
    ],
    "urshifu-rapid-strike": [
      "urshifu-single-strike",
      "urshifu-rapid-strike-gmax",
    ],
    "urshifu-single-strike-gmax": ["urshifu-single-strike"],
    "urshifu-rapid-strike-gmax": ["urshifu-rapid-strike"],
  },
  darmanitan: {
    "darmanitan-standard": ["darmanitan-zen", "darmanitan-galar-standard"],
    "darmanitan-zen": ["darmanitan-standard"],
    "darmanitan-galar-standard": [
      "darmanitan-standard",
      "darmanitan-galar-zen",
    ],
    "darmanitan-galar-zen": ["darmanitan-galar-standard"],
  },
  toxtricity: {
    "toxtricity-amped": ["toxtricity-low-key", "toxtricity-amped-gmax"],
    "toxtricity-low-key": ["toxtricity-amped", "toxtricity-low-key-gmax"],
    "toxtricity-amped-gmax": ["toxtricity-amped"],
    "toxtricity-low-key-gmax": ["toxtricity-low-key"],
  },
};

/**
 * Everything the detail page needs beyond the species itself. `selected` is the
 * variety the page resolved from the URL; an unknown or missing name falls back to
 * the default variety.
 */
export async function getPokemonDetail(
  species: PokemonSpecies,
  selected: PokemonSpecies["varieties"][number],
): Promise<PokemonDetail> {
  const selectedName = selected.pokemon.name;
  const selectedGender = getGender(selectedName);
  const allowed = LIMITED_FORMS[species.name];
  const defaultName = getDefaultFormName(species);
  const links = FORM_LINKS[species.name]?.[selectedName];

  // Offer a form when it is: not the one on screen; of the gender on screen (or
  // has none); allowed by LIMITED_FORMS (if the species is listed there); and
  // linked from the selected form by FORM_LINKS (if the species is listed there).
  // This only needs names, so it runs before any request.
  const offered = species.varieties.filter((v) => {
    const name = v.pokemon.name;
    const gender = getGender(name);
    return (
      name !== selectedName &&
      (gender === null || gender === selectedGender) &&
      (!allowed || name === defaultName || allowed.includes(name)) &&
      (!links || links.includes(name))
    );
  });

  // Form lookups are only needed for display names, so fetch them just for the
  // forms we show, plus the selected one for the caption.
  const [pokemon, selectedForm, forms] = await Promise.all([
    getPokemon(selectedName),
    getPokemonForm(selectedName),
    Promise.all(offered.map((v) => getPokemonForm(v.pokemon.name))),
  ]);

  // Label of a form without its gender, since the gender switch says that.
  const labelFor = (name: string, form: PokemonForm | null) => {
    const label = getFormName(form, species);
    return getGender(name) === null ? label : stripGender(label);
  };

  const otherEntries = offered.map((v, i) => ({
    key: v.pokemon.name,
    label: labelFor(v.pokemon.name, forms[i]),
    id: getIdFromUrl(v.pokemon.url),
    href: `/pokemon/${species.name}${buildVarietyQuery(species, v.pokemon.name)}`,
  }));

  return {
    pokemon,
    selectedId: getIdFromUrl(selected.pokemon.url),
    selectedLabel: labelFor(selectedName, selectedForm),
    otherEntries,
    genderCounterpart: getGenderCounterpart(species, selectedName),
  };
}

/** Name of the other gender's variety, or null when the species has none (no switch is shown). */
export function getGenderCounterpart(
  species: PokemonSpecies,
  selectedName: string,
): string | null {
  const swapped = swapGender(selectedName);
  if (!swapped) return null;

  return species.varieties.some((v) => v.pokemon.name === swapped)
    ? swapped
    : null;
}
