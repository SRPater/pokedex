import { describe, expect, it } from "vitest";
import { getTypeId } from "./pokeapi";

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
