import { describe, expect, it } from "vitest";
import {
  getItemName,
  getLocationName,
  getMoveName,
  getTypeId,
  Location,
  Move,
  type Item,
} from "./pokeapi";

describe("getTypeId", () => {
  it("returns PokéAPI's type IDs", () => {
    // Checked against type/fire, type/water and type/fairy on PokéAPI.
    expect(getTypeId("fire")).toBe(10);
    expect(getTypeId("water")).toBe(11);
    expect(getTypeId("fairy")).toBe(18);
  });

  it("throws for a name that isn't a regular type", () => {
    // Stellar exists in the API but is left out of TYPE_NAMES on purpose.
    expect(() => getTypeId("stellar")).toThrow();
  });
});

const language = (name: string) => ({ name, url: "" });

describe("getItemName", () => {
  it("gives the English name, wherever it is in the list", () => {
    const item: Item = {
      name: "thunder-stone",
      names: [
        { name: "Pierre Foudre", language: language("fr") },
        { name: "Thunder Stone", language: language("en") },
      ],
    };

    expect(getItemName(item)).toBe("Thunder Stone");
  });

  it("falls back to the API's name when there is no English name", () => {
    const item: Item = {
      name: "thunder-stone",
      names: [{ name: "Donnerstein", language: language("de") }],
    };

    expect(getItemName(item)).toBe("thunder-stone");
  });
});

describe("getMoveName", () => {
  it("gives the English name, wherever it is in the list", () => {
    const move: Move = {
      name: "ancient-power",
      names: [
        { name: "Pouvoir Antique", language: language("fr") },
        { name: "Ancient Power", language: language("en") },
      ],
    };

    expect(getMoveName(move)).toBe("Ancient Power");
  });

  it("falls back to the API's name when there is no English name", () => {
    const move: Move = {
      name: "ancient-power",
      names: [{ name: "Antik-Kraft", language: language("de") }],
    };

    expect(getMoveName(move)).toBe("ancient-power");
  });
});

describe("getLocationName", () => {
  it("gives the English name, wherever it is in the list", () => {
    const location: Location = {
      name: "dusty-bowl",
      names: [
        { name: "Sandsturmkessel", language: language("de") },
        { name: "Dusty Bowl", language: language("en") },
      ],
    };

    expect(getLocationName(location)).toBe("Dusty Bowl");
  });

  it("falls back to the API's name when there is no English name", () => {
    const location: Location = {
      name: "dusty-bowl",
      names: [{ name: "Sandsturmkessel", language: language("de") }],
    };

    expect(getLocationName(location)).toBe("dusty-bowl");
  });
});
