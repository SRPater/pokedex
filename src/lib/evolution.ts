import { getConditions, getNatureHint, NatureHint } from "./conditions";
import {
  getEnglishName,
  getEvolutionChain,
  getFormName,
  getIdFromUrl,
  getItem,
  getItemName,
  getLocation,
  getLocationName,
  getMove,
  getMoveName,
  getPokemonForm,
  getSpecies,
  type ChainLink,
  type EvolutionDetail,
  type PokemonSpecies,
} from "./pokeapi";
import { buildVarietyQuery, getGender, stripGender } from "./variety";

/**
 * Every way through the evolution chain, as one list of stages per path, each path
 * starting at the first stage. The chain is a tree, so this walks it recursively:
 * the paths of a stage are the paths of each of its next stages, with the stage
 * itself put in front. A stage with several next stages (Eevee) therefore starts
 * several paths, which is what we want: one row per path in the card.
 */
export function getEvolutionPaths(link: ChainLink): ChainLink[][] {
  // End of a path: nothing evolves from here, so the only path is this stage alone.
  // This is also the whole result for a species that doesn't evolve.
  if (link.evolves_to.length === 0) return [[link]];

  // Every next stage gives its own list of paths. flatMap joins those lists into
  // one, and the stage is put in front of each path on the way back up.
  return link.evolves_to.flatMap((next) =>
    getEvolutionPaths(next).map((path) => [link, ...path]),
  );
}

/**
 * The entries of a stage that apply now. A stage has one entry per game where the
 * rules changed (Leafeon has six), and only the current one is marked `is_default`.
 * Regional alternatives (Raichu, Ninetales) are all marked, so they all stay.
 */
export function getCurrentDetails(
  details: EvolutionDetail[],
): EvolutionDetail[] {
  const current = details.filter((d) => d.is_default);
  // Entries but none marked: keep them all, since dropping them would hide how this
  // stage is reached.
  if (current.length === 0) return details;
  return current;
}

/**
 * The paths that pass through the given species. The evolution chain is shared by
 * the whole family and doesn't know which page it is shown on (Jolteon's page gets
 * the same chain as Eevee's), so the page narrows it down to what is about the
 * species on screen. A path is kept whole, so the stages after the species stay in
 * it too. A species that isn't in any path gives an empty list.
 */
export function getPathsThrough(
  paths: ChainLink[][],
  speciesName: string,
): ChainLink[][] {
  return paths.filter((path) =>
    path.some((link) => link.species.name === speciesName),
  );
}

/**
 * The forms an entry goes from and to, as names. The API leaves a form `null` when
 * it is the default one, so we fill in the species name, which is usually also the
 * name of the default variety (the regional ones, like "raichu-alola", have their
 * own names). Without this, Raichu's two entries can't be told apart: both come
 * from Pikachu, but only one goes to the Alolan form.
 */
export function getEntryForms(
  detail: EvolutionDetail,
  fromSpecies: string,
  toSpecies: string,
): { from: string; to: string } {
  // The form of the previous stage that evolves; null means its default form.
  const from = detail.required_pokemon_form?.name ?? fromSpecies;
  // The form that comes out; null means the default form.
  const to = detail.evolved_pokemon_form?.name ?? toSpecies;

  return { from, to };
}

/**
 * One stage of a path, with its form: "raichu-alola" is the Alolan Raichu stage, whose
 * species is "raichu". `detail` is the entry that says how this stage is reached from
 * the one before it, and is null for the first stage.
 */
export type PathStage = {
  species: string;
  form: string;
  detail: EvolutionDetail | null;
  /**
   * Pokémon ID of this form, for its picture. It starts as the species' ID, which is
   * the ID of its default form; a regional form's own ID (Alolan Raichu) is filled in
   * later, when the species data is at hand.
   */
  id: number;
};

/**
 * Turns a path of stages into one path per combination of forms that really exists.
 * Raichu gives two (normal and Alolan), and a stage after a regional form only follows
 * that form, so every step has to start from the form the step before it ended in.
 * A species that doesn't evolve gives a single path of one stage.
 */
export function getFormPaths(path: ChainLink[]): PathStage[][] {
  const first = path[0].species.name;

  // The chain's species URL ends in the species ID, which is also the default form's
  // Pokémon ID. The same applies to the first partial paths and to the loop below.
  const firstId = getIdFromUrl(path[0].species.url);

  // Nothing to combine: the only form is the species' own.
  if (path.length === 1) {
    return [[{ species: first, form: first, detail: null, id: firstId }]];
  }

  // The first stage has no entry of its own, so its forms are the ones the second
  // stage's entries start from (Vulpix and Alolan Vulpix). A Set drops the repeats:
  // both Raichu entries start from the same Pikachu.
  const firstForms = new Set(
    getCurrentDetails(path[1].evolution_details).map(
      (detail) => getEntryForms(detail, first, path[1].species.name).from,
    ),
  );

  let partials: PathStage[][] = [...firstForms].map((form) => [
    { species: first, form, detail: null, id: firstId },
  ]);

  for (let i = 1; i < path.length; i++) {
    const previous = path[i - 1].species.name;
    const species = path[i].species.name;
    const id = getIdFromUrl(path[i].species.url);
    const details = getCurrentDetails(path[i].evolution_details);

    partials = partials.flatMap((partial) =>
      details.flatMap((detail) => {
        const { from, to } = getEntryForms(detail, previous, species);

        // An entry that starts from another form than this path ended in doesn't belong
        // to it (Obstagoon only follows Galarian Linoone).
        if (from !== partial[partial.length - 1].form) return [];

        return [[...partial, { species, form: to, detail, id }]];
      }),
    );
  }

  return partials;
}

/**
 * The form paths that belong to the form on screen. A path is kept when one of its
 * stages is that form, so Raichu's page shows only the normal path, Alolan Raichu's
 * only the Alolan one, and Pikachu's page (before the split) both. A form that is on
 * no path (Mega Raichu X, Gigantamax Pikachu) falls back to the species' own form,
 * which is the normal chain. The fallback uses the species name, because a stage's
 * form is the species name when the API leaves it null, while the variety on screen
 * can be named differently.
 */
export function getPathsForForm(
  paths: PathStage[][],
  selectedName: string,
  speciesName: string,
): PathStage[][] {
  // The form on screen is on the path: "raichu-alola" matches only the Alolan one.
  const matching = paths.filter((path) =>
    path.some((s) => s.form === selectedName),
  );

  if (matching.length > 0) return matching;

  // Not on any path: show the chain of the species' own form.
  return paths.filter((path) => path.some((s) => s.form === speciesName));
}

/**
 * Removes forms that the species doesn't have as a variety. Alcremie's 63 entries each
 * lead to a cosmetic form ("alcremie-vanilla-cream-strawberry-sweet") that is no variety
 * of Alcremie and has no page or picture of its own, so they are all turned into plain
 * Alcremie and merged into one path. A form that is a variety (Alolan Raichu) stays.
 * `varieties` maps a species name to its variety names; a species that isn't in it
 * counts as having none. Of paths that become the same, the first is kept, so only
 * one of the entries survives (the label for such a path has to go by the trigger).
 */
export function collapseUnknownForms(
  paths: PathStage[][],
  varieties: Map<string, string[]>,
): PathStage[][] {
  // A form is only real when the species lists it as a variety; the species' own
  // name always is, so it needs no lookup.
  const collapsed = paths.map((path) =>
    path.map((stage) =>
      stage.form === stage.species ||
      varieties.get(stage.species)?.includes(stage.form)
        ? stage
        : { ...stage, form: stage.species },
    ),
  );

  // After the replacement, paths that only differed in a cosmetic form are the same.
  const seen = new Set<string>();

  return collapsed.filter((path) => {
    const key = path.map((s) => s.form).join(" > ");
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

/**
 * Gives regional forms their own Pokémon ID. Every stage starts with its species' ID,
 * which is right for the default form but would show normal Raichu for Alolan Raichu
 * (ID 10100). `formIds` maps a variety name to its ID; a form that isn't in it keeps
 * the ID it has.
 */
export function fillFormIds(
  paths: PathStage[][],
  formIds: Map<string, number>,
): PathStage[][] {
  return paths.map((path) =>
    path.map((stage) => ({
      ...stage,
      id: formIds.get(stage.form) ?? stage.id,
    })),
  );
}

/**
 * A stage with the name to show under its picture, and the short lines that say how it
 * is reached ("Level 16", "Thunder Stone"). The first stage has no lines. A stage with
 * a nature condition also has it as a hint, for a tooltip.
 */
export type LabeledStage = PathStage & {
  label: string;
  conditions: string[];
  nature: NatureHint | null;
};

/**
 * Adds the display name and the conditions to every stage. `labels` maps a form to its
 * name; a form that isn't in it shows its raw form name, so a missing name never hides
 * a stage. The conditions come from the stage's own entry (see getConditions).
 */
export function fillLabels(
  paths: PathStage[][],
  labels: Map<string, string>,
  itemNames: Map<string, string>,
  moveNames: Map<string, string>,
  speciesNames: Map<string, string>,
  locationNames: Map<string, string>,
): LabeledStage[][] {
  return paths.map((path) =>
    path.map((stage) => ({
      ...stage,
      label: labels.get(stage.form) ?? stage.form,
      // The first stage has no entry: nothing to say about how it is reached
      conditions: stage.detail
        ? getConditions(
            stage.detail,
            itemNames,
            moveNames,
            speciesNames,
            locationNames,
          )
        : [],
      // Kept apart from the conditions because it carries a tooltip.
      nature: stage.detail ? getNatureHint(stage.detail, stage.species) : null,
    })),
  );
}

/**
 * The name to show for a stage. The species' own form uses the species' name
 * ("Raichu"); any other form uses its form name ("Alolan Raichu"), which falls back to
 * the species' name when the API has no English one. A gender is left out of the
 * name, as in the Forms card, because the page's gender switch shows it.
 */
async function getStageName(stage: PathStage): Promise<string> {
  const species = await getSpecies(stage.species);

  if (stage.form === stage.species) return getEnglishName(species);

  const label = getFormName(await getPokemonForm(stage.form), species);
  return getGender(stage.form) === null ? label : stripGender(label);
}

/** A stage with the link to its page, and whether it is the page already on screen. */
export type LinkedStage = LabeledStage & { href: string; current: boolean };

/**
 * Adds each stage's link and marks the one that is the page on screen, which the card
 * shows without a link. A stage's link is built like the Forms card's: the species
 * page plus what buildVarietyQuery says about the form, so Alolan Raichu is
 * "/pokemon/raichu?region=alola". The stage on screen is the one of the page's species:
 * the paths were already narrowed to the form on screen, so no other stage of that
 * species is left, and a form that is on no path (Mega Raichu X) shows the species' own
 * stage as the current one. The links have no ?shiny; the page adds it, as for the
 * Forms card. `speciesByName` has the species data that buildVarietyQuery needs.
 */
export function fillLinks(
  paths: LabeledStage[][],
  speciesByName: Map<string, PokemonSpecies>,
  currentSpecies: string,
): LinkedStage[][] {
  return paths.map((path) =>
    path.map((stage) => {
      const speciesData = speciesByName.get(stage.species);
      const base = `/pokemon/${stage.species}`;

      // The species' own form is the default one, which the page without a query shows.
      // A species we have no data for gets the same link, since we can't build a query.
      const href =
        stage.form === stage.species || !speciesData
          ? base
          : `${base}${buildVarietyQuery(speciesData, stage.form)}`;

      return { ...stage, href, current: stage.species === currentSpecies };
    }),
  );
}

/**
 * The evolution paths for the page of one form of a species, ready to show: the chain
 * is fetched, split into paths through this species, split again per form, cleaned of
 * forms the species doesn't have, and narrowed to the form on screen. It is one
 * function so the page only has to call it, while each step stays tested on its own.
 */
export async function getEvolutionPathsForPage(
  species: PokemonSpecies,
  selectedName: string,
): Promise<LinkedStage[][]> {
  const chain = await getEvolutionChain(
    getIdFromUrl(species.evolution_chain.url),
  );

  const formPaths = getPathsThrough(
    getEvolutionPaths(chain.chain),
    species.name,
  ).flatMap(getFormPaths);

  // Only species that have a form of their own (Raichu, Ninetales, Alcremie) need
  // their varieties looked up: collapsing changes nothing for the rest. This saves a
  // request per species for chains like Eevee's, which need none.
  const formSpecies = [
    ...new Set(
      formPaths
        .flat()
        .filter((stage) => stage.form !== stage.species)
        .map((stage) => stage.species),
    ),
  ];

  const fetched = await Promise.all(
    formSpecies.map((name) => getSpecies(name)),
  );

  // Species name to variety names, the shape collapseUnknownForms expects.
  const varieties = new Map(
    fetched.map((s) => [s.name, s.varieties.map((v) => v.pokemon.name)]),
  );

  // Variety name to Pokémon ID, so a regional form gets the ID of its own picture.
  // Variety names are unique, so one map for all the species is enough.
  const formIds = new Map(
    fetched.flatMap((s) =>
      s.varieties.map((v): [string, number] => [
        v.pokemon.name,
        getIdFromUrl(v.pokemon.url),
      ]),
    ),
  );

  // The species data that the links need: the page's own species, and the ones fetched
  // above for their forms.
  const speciesByName = new Map(
    [species, ...fetched].map((s): [string, PokemonSpecies] => [s.name, s]),
  );

  // Order matters: unknown forms go first, so Alcremie is one path before the IDs are
  // filled in and before the form on screen is matched against the paths.
  const paths = getPathsForForm(
    fillFormIds(collapseUnknownForms(formPaths, varieties), formIds),
    selectedName,
    species.name,
  );

  // Names only for the stages that are shown, one lookup per distinct form. Responses
  // are cached, so the species fetched above cost nothing a second time.
  const stages = [...new Map(paths.flat().map((s) => [s.form, s])).values()];
  const names = new Map(
    await Promise.all(
      stages.map(
        async (stage): Promise<[string, string]> => [
          stage.form,
          await getStageName(stage),
        ],
      ),
    ),
  );

  // The items the shown entries use or hold ("thunder-stone", "dragon-scale"), once each,
  // to get their English names. Only the shown paths are looked at, so Eevee's page
  // fetches its five stones and not every item in the game.
  const itemSlugs = new Set<string>();

  // The moves the shown entries have to know or use ("ancient-power", "rage-fist"), once
  // each, collected in the same loop as the items.
  const moveSlugs = new Set<string>();

  // The species the shown entries trade for or need in the party ("shelmet", "remoraid"),
  // once each, collected in the same loop as the items and moves.
  const speciesSlugs = new Set<string>();

  // The places the shown entries need ("dusty-bowl"), once each, collected in the same
  // loop as the items, moves and species.
  const locationSlugs = new Set<string>();

  for (const stage of paths.flat()) {
    if (stage.detail?.item) itemSlugs.add(stage.detail.item.name);
    if (stage.detail?.held_item) itemSlugs.add(stage.detail.held_item.name);
    if (stage.detail?.known_move) moveSlugs.add(stage.detail.known_move.name);
    if (stage.detail?.used_move) moveSlugs.add(stage.detail.used_move.name);

    if (stage.detail?.trade_species)
      speciesSlugs.add(stage.detail.trade_species.name);

    if (stage.detail?.party_species)
      speciesSlugs.add(stage.detail.party_species.name);

    if (stage.detail?.location) locationSlugs.add(stage.detail.location.name);
  }

  // API item name to English name, the shape getConditions expects. One request per
  // distinct item, all at once; responses are cached, so only the first visit to a
  // family waits for them.
  const itemNames = new Map(
    await Promise.all(
      [...itemSlugs].map(
        async (slug): Promise<[string, string]> => [
          slug,
          getItemName(await getItem(slug)),
        ],
      ),
    ),
  );

  // API move name to English name, the shape getConditions expects. Same approach as the
  // items above: one request per distinct move, all at once, cached after the first visit.
  const moveNames = new Map(
    await Promise.all(
      [...moveSlugs].map(
        async (slug): Promise<[string, string]> => [
          slug,
          getMoveName(await getMove(slug)),
        ],
      ),
    ),
  );

  // API species name to English name, the shape getConditions expects. Same approach as
  // the items and moves: one request per distinct species, all at once, cached after the
  // first visit.
  const speciesNames = new Map(
    await Promise.all(
      [...speciesSlugs].map(
        async (slug): Promise<[string, string]> => [
          slug,
          getEnglishName(await getSpecies(slug)),
        ],
      ),
    ),
  );

  // API location name to English name, the shape getConditions expects. Same approach as
  // the other three: one request per distinct location, all at once, cached after the
  // first visit.
  const locationNames = new Map(
    await Promise.all(
      [...locationSlugs].map(
        async (slug): Promise<[string, string]> => [
          slug,
          getLocationName(await getLocation(slug)),
        ],
      ),
    ),
  );

  return fillLinks(
    fillLabels(paths, names, itemNames, moveNames, speciesNames, locationNames),
    speciesByName,
    species.name,
  );
}
