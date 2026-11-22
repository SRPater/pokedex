import { describe, expect, it } from "vitest";

import {
  collapseUnknownForms,
  fillFormIds,
  fillLabels,
  fillLinks,
  getCurrentDetails,
  getEntryForms,
  getEvolutionPaths,
  getFormPaths,
  getPathsForForm,
  getPathsThrough,
  type LabeledStage,
  type PathStage,
} from "./evolution";
import type { ChainLink, EvolutionDetail, PokemonSpecies } from "./pokeapi";
import { makeDetail } from "./test-helpers";

// A stage with the given next stages and entries. The URL is a placeholder: most
// functions only use names.
const link = (
  name: string,
  evolves_to: ChainLink[] = [],
  evolution_details: EvolutionDetail[] = [],
): ChainLink => ({
  species: { name, url: "" },
  evolution_details,
  evolves_to,
});

// An entry; undefined stands for `null` in the API.
const entry = (required?: string, evolved?: string): EvolutionDetail =>
  makeDetail({
    required_pokemon_form: required ? { name: required, url: "" } : null,
    evolved_pokemon_form: evolved ? { name: evolved, url: "" } : null,
  });

// Paths as lists of species names, so the expectations are easy to read.
const names = (paths: ChainLink[][]) =>
  paths.map((path) => path.map((l) => l.species.name));

describe("getEvolutionPaths", () => {
  it("gives one path of one stage for a species that doesn't evolve", () => {
    expect(names(getEvolutionPaths(link("ditto")))).toEqual([["ditto"]]);
  });

  it("gives one path for a linear chain", () => {
    const chain = link("charmander", [link("charmeleon", [link("charizard")])]);

    expect(names(getEvolutionPaths(chain))).toEqual([
      ["charmander", "charmeleon", "charizard"],
    ]);
  });

  it("gives one path per branch, each starting with the first stage", () => {
    const chain = link("eevee", [link("vaporeon"), link("jolteon")]);

    expect(names(getEvolutionPaths(chain))).toEqual([
      ["eevee", "vaporeon"],
      ["eevee", "jolteon"],
    ]);
  });

  it("handles a branch in the middle of a chain", () => {
    const chain = link("wurmple", [
      link("silcoon", [link("beautifly")]),
      link("cascoon", [link("dustox")]),
    ]);

    expect(names(getEvolutionPaths(chain))).toEqual([
      ["wurmple", "silcoon", "beautifly"],
      ["wurmple", "cascoon", "dustox"],
    ]);
  });
});

describe("getPathsThrough", () => {
  const eevee = getEvolutionPaths(
    link("eevee", [link("vaporeon"), link("jolteon")]),
  );
  const wurmple = getEvolutionPaths(
    link("wurmple", [
      link("silcoon", [link("beautifly")]),
      link("cascoon", [link("dustox")]),
    ]),
  );

  it("keeps every path for the first stage", () => {
    expect(names(getPathsThrough(eevee, "eevee"))).toEqual([
      ["eevee", "vaporeon"],
      ["eevee", "jolteon"],
    ]);
  });

  it("keeps only the path through a branch", () => {
    expect(names(getPathsThrough(eevee, "jolteon"))).toEqual([
      ["eevee", "jolteon"],
    ]);
  });

  it("keeps the whole path, also the stages after the species", () => {
    expect(names(getPathsThrough(wurmple, "silcoon"))).toEqual([
      ["wurmple", "silcoon", "beautifly"],
    ]);
  });

  it("gives no paths for a species that isn't in the chain", () => {
    expect(getPathsThrough(eevee, "pikachu")).toEqual([]);
  });
});

describe("getCurrentDetails", () => {
  // The evolved form's name tells the entries apart in the expectations.
  const detail = (is_default: boolean, evolved?: string): EvolutionDetail =>
    makeDetail({
      is_default,
      evolved_pokemon_form: evolved ? { name: evolved, url: "" } : null,
    });

  const evolved = (details: EvolutionDetail[]) =>
    details.map((d) => d.evolved_pokemon_form?.name);

  it("keeps only the current entry when the others are per game", () => {
    const details = [detail(false, "a"), detail(false, "b"), detail(true, "c")];

    expect(evolved(getCurrentDetails(details))).toEqual(["c"]);
  });

  it("keeps every current entry, as for regional alternatives", () => {
    const details = [detail(true), detail(true, "raichu-alola")];

    expect(evolved(getCurrentDetails(details))).toEqual([
      undefined,
      "raichu-alola",
    ]);
  });

  it("gives nothing for a stage without entries", () => {
    expect(getCurrentDetails([])).toEqual([]);
  });

  it("keeps all entries when none is marked current", () => {
    const details = [detail(false, "a"), detail(false, "b")];

    expect(getCurrentDetails(details)).toEqual(details);
  });
});

describe("getEntryForms", () => {
  it("uses the species names when both forms are null", () => {
    expect(getEntryForms(entry(), "pichu", "pikachu")).toEqual({
      from: "pichu",
      to: "pikachu",
    });
  });

  it("uses both forms when both are given (Vulpix to Alolan Ninetales)", () => {
    expect(
      getEntryForms(
        entry("vulpix-alola", "ninetales-alola"),
        "vulpix",
        "ninetales",
      ),
    ).toEqual({ from: "vulpix-alola", to: "ninetales-alola" });
  });

  it("uses only the evolved form when the stage before is default (Raichu)", () => {
    expect(
      getEntryForms(entry("pikachu", "raichu-alola"), "pikachu", "raichu"),
    ).toEqual({ from: "pikachu", to: "raichu-alola" });
  });
});

describe("getFormPaths", () => {
  // Each result as "form > form", so the expectations are easy to read.
  const forms = (paths: PathStage[][]) =>
    paths.map((path) => path.map((s) => s.form).join(" > "));

  it("gives one path of one stage for a species that doesn't evolve", () => {
    expect(forms(getFormPaths([link("ditto")]))).toEqual(["ditto"]);
  });

  it("gives one path for a plain chain", () => {
    const path = [
      link("charmander"),
      link("charmeleon", [], [entry()]),
      link("charizard", [], [entry()]),
    ];

    expect(forms(getFormPaths(path))).toEqual([
      "charmander > charmeleon > charizard",
    ]);
  });

  it("splits a stage that can evolve into two forms (Raichu)", () => {
    const path = [
      link("pichu"),
      link("pikachu", [], [entry()]),
      link("raichu", [], [entry("pikachu"), entry("pikachu", "raichu-alola")]),
    ];

    expect(forms(getFormPaths(path))).toEqual([
      "pichu > pikachu > raichu",
      "pichu > pikachu > raichu-alola",
    ]);
  });

  it("starts from each form of the first stage (Vulpix)", () => {
    const path = [
      link("vulpix"),
      link(
        "ninetales",
        [],
        [entry(), entry("vulpix-alola", "ninetales-alola")],
      ),
    ];

    expect(forms(getFormPaths(path))).toEqual([
      "vulpix > ninetales",
      "vulpix-alola > ninetales-alola",
    ]);
  });

  it("only joins steps whose forms fit together", () => {
    // Obstagoon only follows Galarian Linoone, not the normal one.
    const path = [
      link("zigzagoon"),
      link("linoone", [], [entry(), entry("zigzagoon-galar", "linoone-galar")]),
      link("obstagoon", [], [entry("linoone-galar")]),
    ];

    expect(forms(getFormPaths(path))).toEqual([
      "zigzagoon-galar > linoone-galar > obstagoon",
    ]);
  });

  it("keeps how each stage is reached", () => {
    const reached = entry();
    const result = getFormPaths([
      link("pichu"),
      link("pikachu", [], [reached]),
    ]);

    expect(result[0][0].detail).toBeNull();
    expect(result[0][1].detail).toBe(reached);
  });

  it("gives each stage the species ID from the chain", () => {
    const path: ChainLink[] = [
      {
        species: {
          name: "pichu",
          url: "https://pokeapi.co/api/v2/pokemon-species/172/",
        },
        evolution_details: [],
        evolves_to: [],
      },
      {
        species: {
          name: "pikachu",
          url: "https://pokeapi.co/api/v2/pokemon-species/25/",
        },
        evolution_details: [entry()],
        evolves_to: [],
      },
    ];

    expect(getFormPaths(path)[0].map((s) => s.id)).toEqual([172, 25]);
  });
});

describe("getPathsForForm", () => {
  // The species is the form's own name unless given (the Alolan Raichu stage is a Raichu).
  const stage = (form: string, species = form): PathStage => ({
    species,
    form,
    detail: null,
    id: 0,
  });
  const forms = (paths: PathStage[][]) =>
    paths.map((path) => path.map((s) => s.form).join(" > "));

  const raichu = [
    [stage("pichu"), stage("pikachu"), stage("raichu")],
    [stage("pichu"), stage("pikachu"), stage("raichu-alola", "raichu")],
  ];

  it("keeps both paths on a page before the split (Pikachu)", () => {
    expect(forms(getPathsForForm(raichu, "pikachu", "pikachu"))).toEqual([
      "pichu > pikachu > raichu",
      "pichu > pikachu > raichu-alola",
    ]);
  });

  it("keeps only the normal path on the normal form's page", () => {
    expect(forms(getPathsForForm(raichu, "raichu", "raichu"))).toEqual([
      "pichu > pikachu > raichu",
    ]);
  });

  it("keeps only the regional path on the regional form's page", () => {
    expect(forms(getPathsForForm(raichu, "raichu-alola", "raichu"))).toEqual([
      "pichu > pikachu > raichu-alola",
    ]);
  });

  it("falls back to the species' own form for a form on no path", () => {
    expect(forms(getPathsForForm(raichu, "raichu-mega-x", "raichu"))).toEqual([
      "pichu > pikachu > raichu",
    ]);
  });

  it("falls back to the species name when the default variety is named differently", () => {
    const meowstic = [[stage("espurr"), stage("meowstic")]];

    expect(
      forms(getPathsForForm(meowstic, "meowstic-male", "meowstic")),
    ).toEqual(["espurr > meowstic"]);
  });

  it("gives nothing when neither the form nor the species is on a path", () => {
    expect(getPathsForForm(raichu, "eevee", "eevee")).toEqual([]);
  });
});

describe("collapseUnknownForms", () => {
  const stage = (
    species: string,
    form = species,
    detail: EvolutionDetail | null = null,
  ): PathStage => ({ species, form, detail, id: 0 });
  const forms = (paths: PathStage[][]) =>
    paths.map((path) => path.map((s) => s.form).join(" > "));

  const varieties = new Map([
    ["raichu", ["raichu", "raichu-alola"]],
    ["alcremie", ["alcremie"]],
  ]);

  it("keeps a form that is a variety of its species", () => {
    const paths = [
      [stage("pikachu"), stage("raichu")],
      [stage("pikachu"), stage("raichu", "raichu-alola")],
    ];

    expect(forms(collapseUnknownForms(paths, varieties))).toEqual([
      "pikachu > raichu",
      "pikachu > raichu-alola",
    ]);
  });

  it("turns a form that isn't a variety into the species' own form", () => {
    const paths = [
      [
        stage("milcery"),
        stage("alcremie", "alcremie-vanilla-cream-strawberry-sweet"),
      ],
    ];

    expect(forms(collapseUnknownForms(paths, varieties))).toEqual([
      "milcery > alcremie",
    ]);
  });

  it("merges paths that become the same, keeping the first one's entry", () => {
    const first = entry();
    const second = entry();
    const paths = [
      [
        stage("milcery"),
        stage("alcremie", "alcremie-vanilla-cream-strawberry-sweet", first),
      ],
      [
        stage("milcery"),
        stage("alcremie", "alcremie-ruby-cream-strawberry-sweet", second),
      ],
    ];

    const result = collapseUnknownForms(paths, varieties);

    expect(forms(result)).toEqual(["milcery > alcremie"]);
    expect(result[0][1].detail).toBe(first);
  });

  it("treats a species that isn't in the map as having no known forms", () => {
    const paths = [[stage("vulpix"), stage("ninetales", "ninetales-alola")]];

    expect(forms(collapseUnknownForms(paths, new Map()))).toEqual([
      "vulpix > ninetales",
    ]);
  });
});

describe("fillFormIds", () => {
  const stage = (form: string, id: number): PathStage => ({
    species: "raichu",
    form,
    detail: null,
    id,
  });
  const ids = (paths: PathStage[][]) =>
    paths.map((path) => path.map((s) => s.id));

  const formIds = new Map([
    ["raichu", 26],
    ["raichu-alola", 10100],
  ]);

  it("gives a regional form its own ID", () => {
    const paths = [[stage("raichu-alola", 26)]];

    expect(ids(fillFormIds(paths, formIds))).toEqual([[10100]]);
  });

  it("keeps the ID of a form that isn't in the map", () => {
    const paths = [[stage("pichu", 172)]];

    expect(ids(fillFormIds(paths, formIds))).toEqual([[172]]);
  });

  it("doesn't change the paths it was given", () => {
    const paths = [[stage("raichu-alola", 26)]];

    fillFormIds(paths, formIds);

    expect(paths[0][0].id).toBe(26);
  });
});

describe("fillLabels", () => {
  const stage = (
    form: string,
    detail: EvolutionDetail | null = null,
  ): PathStage => ({
    species: "raichu",
    form,
    detail,
    id: 0,
  });

  const labels = (paths: PathStage[][], names: Map<string, string>) =>
    fillLabels(paths, names, new Map(), new Map(), new Map(), new Map()).map(
      (path) => path.map((s) => s.label),
    );

  it("gives each stage the name of its form", () => {
    const names = new Map([
      ["raichu", "Raichu"],
      ["raichu-alola", "Alolan Raichu"],
    ]);

    expect(labels([[stage("raichu")], [stage("raichu-alola")]], names)).toEqual(
      [["Raichu"], ["Alolan Raichu"]],
    );
  });

  it("shows the form's own name when it has no label", () => {
    expect(labels([[stage("raichu-alola")]], new Map())).toEqual([
      ["raichu-alola"],
    ]);
  });

  it("gives each stage the lines of its entry, and none for the first stage", () => {
    const itemNames = new Map([["thunder-stone", "Thunder Stone"]]);
    const detail = makeDetail({
      trigger: { name: "use-item", url: "" },
      item: { name: "thunder-stone", url: "" },
    });

    const result = fillLabels(
      [[stage("pikachu"), stage("raichu", detail)]],
      new Map(),
      itemNames,
      new Map(),
      new Map(),
      new Map(),
    );

    expect(result[0].map((s) => s.conditions)).toEqual([[], ["Thunder Stone"]]);
  });

  it("uses the English names of the moves in the lines", () => {
    const moveNames = new Map([["ancient-power", "Ancient Power"]]);
    const detail = makeDetail({
      known_move: { name: "ancient-power", url: "" },
    });

    const result = fillLabels(
      [[stage("piloswine"), stage("mamoswine", detail)]],
      new Map(),
      new Map(),
      moveNames,
      new Map(),
      new Map(),
    );

    expect(result[0][1].conditions).toEqual([
      "Level up",
      "Knowing Ancient Power",
    ]);
  });

  it("uses the English names of the species in the lines", () => {
    const speciesNames = new Map([["shelmet", "Shelmet"]]);
    const detail = makeDetail({
      trigger: { name: "trade", url: "" },
      trade_species: { name: "shelmet", url: "" },
    });

    const result = fillLabels(
      [[stage("karrablast"), stage("escavelier", detail)]],
      new Map(),
      new Map(),
      new Map(),
      speciesNames,
      new Map(),
    );

    expect(result[0][1].conditions).toEqual(["Trade for Shelmet"]);
  });

  it("uses the English names of the locations in the lines", () => {
    const locationNames = new Map([["dusty-bowl", "Dusty Bowl"]]);
    const detail = makeDetail({
      location: { name: "dusty-bowl", url: "" },
    });

    const result = fillLabels(
      [[stage("yamask"), stage("runerigus", detail)]],
      new Map(),
      new Map(),
      new Map(),
      new Map(),
      locationNames,
    );

    expect(result[0][1].conditions).toEqual(["Level up", "In Dusty Bowl"]);
  });
});

describe("fillLinks", () => {
  const stage = (species: string, form = species): LabeledStage => ({
    species,
    form,
    detail: null,
    id: 0,
    label: form,
    conditions: [],
    nature: null,
  });

  // A species with only what the links read: its name and its varieties, the first
  // one being the default.
  const speciesWith = (name: string, varieties: string[]) =>
    ({
      name,
      varieties: varieties.map((v, i) => ({
        is_default: i === 0,
        pokemon: { name: v, url: "" },
      })),
    }) as PokemonSpecies;

  const bySpecies = new Map([
    [
      "raichu",
      speciesWith("raichu", ["raichu", "raichu-alola", "raichu-mega-x"]),
    ],
    ["meowstic", speciesWith("meowstic", ["meowstic-male", "meowstic-female"])],
  ]);

  const links = (paths: LabeledStage[][]) =>
    fillLinks(paths, bySpecies, "").map((path) => path.map((s) => s.href));
  const currents = (paths: LabeledStage[][], currentSpecies: string) =>
    fillLinks(paths, bySpecies, currentSpecies).map((path) =>
      path.map((s) => s.current),
    );

  it("links a stage in the species' own form to the plain page", () => {
    expect(links([[stage("pikachu"), stage("raichu")]])).toEqual([
      ["/pokemon/pikachu", "/pokemon/raichu"],
    ]);
  });

  it("puts the region in the link of a regional form", () => {
    expect(links([[stage("raichu", "raichu-alola")]])).toEqual([
      ["/pokemon/raichu?region=alola"],
    ]);
  });

  it("puts the gender in the link of the non-default gender", () => {
    expect(
      links([
        [stage("meowstic", "meowstic-male")],
        [stage("meowstic", "meowstic-female")],
      ]),
    ).toEqual([["/pokemon/meowstic"], ["/pokemon/meowstic?gender=female"]]);
  });

  it("links to the plain page for a species it has no data for", () => {
    expect(links([[stage("vulpix", "vulpix-alola")]])).toEqual([
      ["/pokemon/vulpix"],
    ]);
  });

  it("marks the stage of the species on screen", () => {
    const paths = [[stage("pikachu"), stage("raichu", "raichu-alola")]];

    expect(currents(paths, "raichu")).toEqual([[false, true]]);
  });

  it("marks the species' own stage for a form that is on no stage (Mega Raichu X)", () => {
    const paths = [[stage("pikachu"), stage("raichu")]];

    expect(currents(paths, "raichu")).toEqual([[false, true]]);
  });
});
