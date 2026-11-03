import { describe, expect, it } from "vitest";
import type { PokemonSpecies } from "./pokeapi";
import { buildVarietyQuery, findVariety, parseVariety, stripGender, swapGender } from "./variety";

describe("parseVariety", () => {
  it.each([
    ["charizard", "charizard", { form: null, region: null, gender: null }],
    ["charizard", "charizard-mega-x", { form: "mega-x", region: null, gender: null }],
    ["meowstic", "meowstic-female-mega", { form: "mega", region: null, gender: "female" }],
    ["raichu", "raichu-alola", { form: null, region: "alola", gender: null }],
    ["darmanitan", "darmanitan-galar-zen", { form: "zen", region: "galar", gender: null }],
    ["darmanitan", "darmanitan-standard", { form: "standard", region: null, gender: null }],
    ["tauros", "tauros-paldea-combat-breed", { form: "combat-breed", region: "paldea", gender: null }],
    ["urshifu", "urshifu-rapid-strike-gmax", { form: "rapid-strike-gmax", region: null, gender: null }],
    ["mr-mime", "mr-mime-galar", { form: null, region: "galar", gender: null }],
  ])("%s / %s", (species, variety, expected) => {
    expect(parseVariety(species, variety)).toEqual(expected);
  });
});

function makeSpecies(name: string, varieties: string[]): PokemonSpecies {
  return {
    name,
    varieties: varieties.map((variety, i) => ({
      is_default: i === 0,
      pokemon: { name: variety, url: "" },
    })),
  } as PokemonSpecies;
}

const meowstic = makeSpecies("meowstic", [
  "meowstic-male",
  "meowstic-female",
  "meowstic-male-mega",
  "meowstic-female-mega",
]);

const charizard = makeSpecies("charizard", [
  "charizard",
  "charizard-mega-x",
  "charizard-mega-y",
  "charizard-gmax",
]);

const darmanitan = makeSpecies("darmanitan", [
  "darmanitan-standard",
  "darmanitan-zen",
  "darmanitan-galar-standard",
  "darmanitan-galar-zen",
]);

const tauros = makeSpecies("tauros", [
  "tauros",
  "tauros-paldea-combat-breed",
  "tauros-paldea-blaze-breed",
  "tauros-paldea-aqua-breed",
]);

const urshifu = makeSpecies("urshifu", [
  "urshifu-single-strike",
  "urshifu-rapid-strike",
  "urshifu-single-strike-gmax",
  "urshifu-rapid-strike-gmax",
]);

const rotom = makeSpecies("rotom", [
  "rotom",
  "rotom-heat",
  "rotom-wash",
  "rotom-frost",
  "rotom-fan",
  "rotom-mow",
]);

const lycanroc = makeSpecies("lycanroc", [
  "lycanroc-midday",
  "lycanroc-midnight",
  "lycanroc-dusk",
]);

const ogerpon = makeSpecies("ogerpon", [
  "ogerpon",
  "ogerpon-wellspring-mask",
  "ogerpon-hearthflame-mask",
  "ogerpon-cornerstone-mask",
]);

const zygarde = makeSpecies("zygarde", [
  "zygarde-50",
  "zygarde-10-power-construct",
  "zygarde-50-power-construct",
  "zygarde-complete",
  "zygarde-10",
  "zygarde-mega",
]);

const speciesByName: Record<string, PokemonSpecies> = {
  meowstic,
  charizard,
  darmanitan,
  tauros,
  urshifu,
  rotom,
  lycanroc,
  ogerpon,
  zygarde,
};

describe("findVariety", () => {
  it.each([
    ["meowstic", {}, "meowstic-male"],
    ["meowstic", { gender: "female" }, "meowstic-female"],
    ["meowstic", { form: "mega" }, "meowstic-male-mega"],
    ["meowstic", { form: "mega", gender: "female" }, "meowstic-female-mega"],
    ["charizard", { form: "mega-x" }, "charizard-mega-x"],
    ["charizard", { gender: "female" }, undefined],
    ["darmanitan", { form: "zen" }, "darmanitan-zen"],
    ["darmanitan", { region: "galar" }, "darmanitan-galar-standard"],
    ["darmanitan", { region: "galar", form: "zen" }, "darmanitan-galar-zen"],
    ["tauros", { region: "paldea", form: "combat-breed" }, "tauros-paldea-combat-breed"],
    ["urshifu", { form: "rapid-strike" }, "urshifu-rapid-strike"],
  ])("%s %j -> %s", (name, wanted, expected) => {
    expect(findVariety(speciesByName[name], wanted)?.pokemon.name).toBe(expected);
  });
});

describe("buildVarietyQuery", () => {
  it.each([
    ["meowstic", "meowstic-male", ""],
    ["meowstic", "meowstic-female", "?gender=female"],
    ["meowstic", "meowstic-male-mega", "?form=mega"],
    ["meowstic", "meowstic-female-mega", "?form=mega&gender=female"],
    ["charizard", "charizard", ""],
    ["charizard", "charizard-mega-x", "?form=mega-x"],
    ["darmanitan", "darmanitan-standard", ""],
    ["darmanitan", "darmanitan-zen", "?form=zen"],
    ["darmanitan", "darmanitan-galar-standard", "?region=galar"],
    ["darmanitan", "darmanitan-galar-zen", "?form=zen&region=galar"],
    ["tauros", "tauros-paldea-combat-breed", "?form=combat-breed&region=paldea"],
    ["urshifu", "urshifu-rapid-strike", "?form=rapid-strike"],
  ])("%s / %s -> %j", (name, variety, expected) => {
    expect(buildVarietyQuery(speciesByName[name], variety)).toBe(expected);
  });
});

describe("round trip", () => {
  it.each(Object.keys(speciesByName))("%s", (name) => {
    const species = speciesByName[name];
    for (const variety of species.varieties) {
      const query = buildVarietyQuery(species, variety.pokemon.name);
      const params = new URLSearchParams(query);
      const wanted = {
        form: params.get("form") ?? undefined,
        region: params.get("region") ?? undefined,
        gender: params.get("gender") ?? undefined,
      };

      const found = findVariety(species, wanted);
      expect(found?.pokemon.name).toBe(variety.pokemon.name);
    }
  });
});

describe("swapGender", () => {
  it.each([
    ["meowstic-male", "meowstic-female"],
    ["meowstic-female", "meowstic-male"],
    ["meowstic-male-mega", "meowstic-female-mega"],
    ["indeedee-female", "indeedee-male"],
    ["charizard-mega-x", null],
  ])("%s -> %s", (name, expected) => {
    expect(swapGender(name)).toBe(expected);
  });
});

describe("stripGender", () => {
  it.each([
    ["Male Meowstic", "Meowstic"],
    ["Female Meowstic", "Meowstic"],
    ["Mega Meowstic", "Mega Meowstic"],
    ["Mega Charizard X", "Mega Charizard X"],
  ])("%s -> %s", (label, expected) => {
    expect(stripGender(label)).toBe(expected);
  });
});
