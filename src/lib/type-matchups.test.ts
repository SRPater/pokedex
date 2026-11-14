import { describe, expect, it } from "vitest";

import type { DamageFrom } from "./pokeapi";
import { combineMatchups } from "./type-matchups";

// Real data from PokéAPI (type/fire and type/flying), so the test needs no network.
const fire: DamageFrom = {
  double: ["water", "ground", "rock"],
  half: ["fire", "grass", "ice", "bug", "steel", "fairy"],
  none: [],
};
const flying: DamageFrom = {
  double: ["electric", "ice", "rock"],
  half: ["grass", "fighting", "bug"],
  none: ["ground"],
};

describe("combineMatchups", () => {
  it("passes a single type through unchanged", () => {
    const matchups = combineMatchups([fire]);
    expect(matchups.get("water")).toBe(2);
    expect(matchups.get("fire")).toBe(0.5);
    // Not listed means normal damage.
    expect(matchups.get("normal")).toBeUndefined();
  });

  it("multiplies two types (Charizard: fire/flying)", () => {
    const matchups = combineMatchups([fire, flying]);
    expect(matchups.get("rock")).toBe(4);     // weak on both
    expect(matchups.get("grass")).toBe(0.25); // resisted by both
    expect(matchups.get("ice")).toBe(1);      // weak on one, resisted by the other
  });

  it("lets an immunity beat a weakness", () => {
    // Fire is weak to ground, but flying is immune to it.
    expect(combineMatchups([fire, flying]).get("ground")).toBe(0);
  });
});
