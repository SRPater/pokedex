import { describe, expect, it } from "vitest";
import { nextSort, parseSort, sortDirection, sortSpecies } from "./sort";

describe ("parseSort", () => {
  it.each([
    ["number", "number"],
    ["number-desc", "number-desc"],
    ["name", "name"],
    ["name-desc", "name-desc"],
    [undefined, "number"],
    ["", "number"],
    ["nonsense", "number"],
    ["NAME", "name"],
  ])("%j -> %j", (value, expected) => {
    expect(parseSort(value)).toBe(expected);
  });
});

// In Pokédex order (#1, #25, #122, #132), as getAllSpeciesNames returns them.
const items = ["bulbasaur", "pikachu", "mr-mime", "ditto"].map((name) => ({ name }));

describe("sortSpecies", () => {
  it.each([
    ["number", ["bulbasaur", "pikachu", "mr-mime", "ditto"]],
    ["number-desc", ["ditto", "mr-mime", "pikachu", "bulbasaur"]],
    ["name", ["bulbasaur", "ditto", "mr-mime", "pikachu"]],
    ["name-desc", ["pikachu", "mr-mime", "ditto", "bulbasaur"]],
  ] as const)("%s", (sort, expected) => {
    expect(sortSpecies(items, sort).map((i) => i.name)).toEqual(expected);
  });

  it("does not change the list it was given", () => {
    sortSpecies(items, "name-desc");
    expect(items.map((i) => i.name)).toEqual(["bulbasaur", "pikachu", "mr-mime", "ditto"]);
  });
});

describe("nextSort", () => {
  it.each([
    ["number", "number", "number-desc"],
    ["number-desc", "number", "number"],
    ["name", "number", "number"],
    ["name-desc", "number", "number"],
    ["number", "name", "name"],
    ["name", "name", "name-desc"],
    ["name-desc", "name", "name"],
    ["number-desc", "name", "name"],
  ] as const)("%s, click %s -> %s", (current, column, expected) => {
    expect(nextSort(current, column)).toBe(expected);
  });
});

describe("sortDirection", () => {
  it.each([
    ["number", "number", "ascending"],
    ["number-desc", "number", "descending"],
    ["name", "number", null],
    ["number", "name", null],
    ["name", "name", "ascending"],
    ["name-desc", "name", "descending"],
  ] as const)("%s on %s -> %j", (current, column, expected) => {
    expect(sortDirection(current, column)).toBe(expected);
  });
});
