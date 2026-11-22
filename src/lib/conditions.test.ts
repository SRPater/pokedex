import { describe, expect, it } from "vitest";

import { getConditions, getNatureHint } from "./conditions";
import type { EvolutionDetail } from "./pokeapi";
import { makeDetail } from "./test-helpers";

describe("getConditions", () => {
  const itemNames = new Map([
    ["thunder-stone", "Thunder Stone"],
    ["dragon-scale", "Dragon Scale"],
    ["leaders-crest", "Leader's Crest"],
  ]);

  const moveNames = new Map([
    ["ancient-power", "Ancient Power"],
    ["psyshield-bash", "Psyshield Bash"],
    ["rage-fist", "Rage Fist"],
  ]);

  const speciesNames = new Map([
    ["shelmet", "Shelmet"],
    ["remoraid", "Remoraid"],
  ]);

  const locationNames = new Map([["dusty-bowl", "Dusty Bowl"]]);

  const trigger = (name: string) => ({ name, url: "" });

  it("shows the level for a level-up (Charmeleon)", () => {
    expect(getConditions(makeDetail({ min_level: 16 }), itemNames)).toEqual([
      "Level 16",
    ]);
  });

  it("shows the English name of the item (Raichu)", () => {
    const detail = makeDetail({
      trigger: trigger("use-item"),
      item: { name: "thunder-stone", url: "" },
    });

    expect(getConditions(detail, itemNames)).toEqual(["Thunder Stone"]);
  });

  it("shows the raw item name when it has no English name yet", () => {
    const detail = makeDetail({
      trigger: trigger("use-item"),
      item: { name: "fire-stone", url: "" },
    });

    expect(getConditions(detail, itemNames)).toEqual(["fire-stone"]);
  });

  it("says to use an item when the entry names none", () => {
    const detail = makeDetail({ trigger: trigger("use-item") });

    expect(getConditions(detail, itemNames)).toEqual(["Use an item"]);
  });

  it("shows a trade (Machamp)", () => {
    expect(
      getConditions(makeDetail({ trigger: trigger("trade") }), itemNames),
    ).toEqual(["Trade"]);
  });

  it("shows friendship and the time of day (Espeon)", () => {
    const detail = makeDetail({ min_happiness: 160, time_of_day: "day" });

    expect(getConditions(detail, itemNames)).toEqual([
      "Level up",
      "Friendship",
      "Daytime",
    ]);
  });

  it("shows the night as a line of its own (Umbreon)", () => {
    const detail = makeDetail({ min_happiness: 160, time_of_day: "night" });

    expect(getConditions(detail, itemNames)).toEqual([
      "Level up",
      "Friendship",
      "Nighttime",
    ]);
  });

  it("shows the trigger for a plain level-up", () => {
    expect(getConditions(makeDetail(), itemNames)).toEqual(["Level up"]);
  });

  it("turns a trigger without a label into words", () => {
    const detail = makeDetail({ trigger: trigger("unclassified") });

    expect(getConditions(detail, itemNames)).toEqual(["Unclassified"]);
  });

  it.each([
    ["shed", ["Empty party slot", "Poké Ball in bag"]],
    ["spin", ["Spin with a Sweet"]],
    ["tower-of-darkness", ["Tower of Darkness"]],
    ["tower-of-waters", ["Tower of Waters"]],
    ["three-critical-hits", ["3 critical hits in one battle"]],
    ["three-defeated-bisharp", ["Defeat 3 leader Bisharp"]],
    ["gimmighoul-coins", ["999 Gimmighoul Coins"]],
    ["meltan-candies", ["400 Meltan Candies"]],
    ["agile-style-move", ["Agile Style"]],
    ["strong-style-move", ["Strong Style"]],
    ["use-move", ["Level up"]],
  ])("shows the lines of the %s trigger", (name, expected) => {
    expect(
      getConditions(makeDetail({ trigger: trigger(name) }), itemNames),
    ).toEqual(expected);
  });

  it("ignores the other fields for such a trigger (Alcremie)", () => {
    const detail = makeDetail({
      trigger: trigger("spin"),
      min_happiness: 160,
      time_of_day: "day",
    });

    expect(getConditions(detail, itemNames)).toEqual(["Spin with a Sweet"]);
  });

  it("shows the damage to take (Runerigus)", () => {
    const detail = makeDetail({
      trigger: trigger("take-damage"),
      min_damage_taken: 49,
    });

    expect(getConditions(detail, itemNames)).toEqual(["Take 49 damage"]);
  });

  it("shows the recoil damage to take (Basculegion)", () => {
    const detail = makeDetail({
      trigger: trigger("recoil-damage"),
      min_damage_taken: 294,
    });

    expect(getConditions(detail, itemNames)).toEqual([
      "Take 294 recoil damage",
    ]);
  });

  it("falls back to the plain wording without a damage number", () => {
    expect(
      getConditions(makeDetail({ trigger: trigger("take-damage") }), itemNames),
    ).toEqual(["Take damage"]);
  });

  it("shows the steps to walk", () => {
    const detail = makeDetail({ min_steps: 1000 });

    expect(getConditions(detail, itemNames)).toEqual([
      "Level up",
      "Walk 1000 steps",
    ]);
  });

  it("shows a male-only evolution (Gallade)", () => {
    const detail = makeDetail({
      trigger: trigger("use-item"),
      item: { name: "thunder-stone", url: "" },
      gender: 2,
    });

    expect(getConditions(detail, itemNames)).toEqual(["Thunder Stone", "Male"]);
  });

  it("shows a female-only evolution (Basculegion)", () => {
    const detail = makeDetail({
      trigger: trigger("recoil-damage"),
      min_damage_taken: 294,
      gender: 1,
    });

    expect(getConditions(detail, itemNames)).toEqual([
      "Take 294 recoil damage",
      "Female",
    ]);
  });

  it("shows no gender line when the gender doesn't matter", () => {
    expect(getConditions(makeDetail({ min_level: 16 }), itemNames)).toEqual([
      "Level 16",
    ]);
  });

  it("shows the other fields after the fixed lines of a trigger (not spin)", () => {
    const detail = makeDetail({
      trigger: trigger("three-critical-hits"),
      time_of_day: "day",
    });

    expect(getConditions(detail, itemNames)).toEqual([
      "3 critical hits in one battle",
      "Daytime",
    ]);
  });

  it("shows the item to hold after the trigger's line (Kingdra)", () => {
    const detail = makeDetail({
      trigger: trigger("trade"),
      held_item: { name: "dragon-scale", url: "" },
    });

    expect(getConditions(detail, itemNames)).toEqual([
      "Trade",
      "Holding Dragon Scale",
    ]);
  });

  it("shows the raw item name when it has no English name yet", () => {
    const detail = makeDetail({
      trigger: trigger("trade"),
      held_item: { name: "razor-fang", url: "" },
    });

    expect(getConditions(detail, itemNames)).toEqual([
      "Trade",
      "Holding razor-fang",
    ]);
  });

  it("shows the item to hold after a trigger with fixed lines (Kingambit)", () => {
    const detail = makeDetail({
      trigger: trigger("three-defeated-bisharp"),
      held_item: { name: "leaders-crest", url: "" },
    });

    expect(getConditions(detail, itemNames)).toEqual([
      "Defeat 3 leader Bisharp",
      "Holding Leader's Crest",
    ]);
  });

  it("says level up before the other conditions (Gliscor)", () => {
    const detail = makeDetail({
      held_item: { name: "razor-fang", url: "" },
      time_of_day: "night",
    });

    expect(getConditions(detail, itemNames)).toEqual([
      "Level up",
      "Holding razor-fang",
      "Nighttime",
    ]);
  });

  it("shows a move that has to be known (Mamoswine)", () => {
    const detail = makeDetail({
      known_move: { name: "ancient-power", url: "" },
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Level up",
      "Knowing Ancient Power",
    ]);
  });

  it("shows the raw move name when it has no English name yet", () => {
    const detail = makeDetail({
      known_move: { name: "barb-barrage", url: "" },
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Level up",
      "Knowing barb-barrage",
    ]);
  });

  it("shows a type of move that has to be known (Sylveon)", () => {
    const detail = makeDetail({
      known_move_type: { name: "fairy", url: "" },
      min_happiness: 160,
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Level up",
      "Knowing a Fairy-type move",
      "Friendship",
    ]);
  });

  it("shows the style and the move to use (Wyrdeer)", () => {
    const detail = makeDetail({
      trigger: trigger("agile-style-move"),
      used_move: { name: "psyshield-bash", url: "" },
      min_move_count: 20,
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Agile Style",
      "Use Psyshield Bash 20 times",
    ]);
  });

  it("shows a level-up and the used move for a use-move trigger (Annihilape)", () => {
    const detail = makeDetail({
      trigger: trigger("use-move"),
      used_move: { name: "rage-fist", url: "" },
      min_move_count: 20,
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Level up",
      "Use Rage Fist 20 times",
    ]);
  });

  it("shows a used move without a count", () => {
    const detail = makeDetail({
      trigger: trigger("use-move"),
      used_move: { name: "rage-fist", url: "" },
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Level up",
      "Use Rage Fist",
    ]);
  });

  // Typed, so the values in the rows are checked against EvolutionDetail and not widened
  // to plain numbers.
  const smallConditions: [string, Partial<EvolutionDetail>, string][] = [
    [
      "higher Attack",
      { relative_physical_stats: 1 },
      "Attack higher than Defense",
    ],
    [
      "higher Defense",
      { relative_physical_stats: -1 },
      "Defense higher than Attack",
    ],
    ["equal stats", { relative_physical_stats: 0 }, "Attack equal to Defense"],
    ["rain", { needs_overworld_rain: true }, "While raining"],
    ["upside down", { turn_upside_down: true }, "Console upside down"],
    ["multiplayer", { needs_multiplayer: true }, "In a Union Circle"],
    ["region", { region: { name: "alola", url: "" } }, "In Alola"],
    [
      "party type",
      { party_type: { name: "dark", url: "" } },
      "Dark-type in party",
    ],
  ];

  it.each(smallConditions)(
    "shows the %s condition",
    (_name, overrides, line) => {
      expect(
        getConditions(makeDetail(overrides), itemNames, moveNames),
      ).toEqual(["Level up", line]);
    },
  );

  it("shows nothing extra when the small conditions are not set", () => {
    expect(
      getConditions(makeDetail({ min_level: 16 }), itemNames, moveNames),
    ).toEqual(["Level 16"]);
  });

  it("shows the level and the chance of an in-battle level-up (Maushold)", () => {
    const detail = makeDetail({
      trigger: trigger("in-battle-level-up"),
      min_level: 25,
      condition_expression: { percentage_chance: 99 },
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Level 25 in battle",
      "99% chance",
    ]);
  });

  it("says level up in battle when there is no level", () => {
    const detail = makeDetail({ trigger: trigger("in-battle-level-up") });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Level up in battle",
    ]);
  });

  it("shows the chance after the other conditions (Silcoon)", () => {
    const detail = makeDetail({
      min_level: 7,
      condition_expression: { percentage_chance: 50 },
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual([
      "Level 7",
      "50% chance",
    ]);
  });

  it("shows no chance when the line is null", () => {
    const detail = makeDetail({
      condition_expression: { percentage_chance: null },
    });

    expect(getConditions(detail, itemNames, moveNames)).toEqual(["Level up"]);
  });

  it("shows the species to trade for (Escavelier)", () => {
    const detail = makeDetail({
      trigger: trigger("trade"),
      trade_species: { name: "shelmet", url: "" },
    });

    expect(getConditions(detail, itemNames, moveNames, speciesNames)).toEqual([
      "Trade for Shelmet",
    ]);
  });

  it("shows the raw species name when it has no English name yet", () => {
    const detail = makeDetail({
      trigger: trigger("trade"),
      trade_species: { name: "karrablast", url: "" },
    });

    expect(getConditions(detail, itemNames, moveNames, speciesNames)).toEqual([
      "Trade for karrablast",
    ]);
  });

  it("shows the species that has to be in the party (Mantine)", () => {
    const detail = makeDetail({
      party_species: { name: "remoraid", url: "" },
    });

    expect(getConditions(detail, itemNames, moveNames, speciesNames)).toEqual([
      "Level up",
      "Remoraid in party",
    ]);
  });

  it("shows the place it has to happen in (Runerigus)", () => {
    const detail = makeDetail({
      trigger: trigger("take-damage"),
      min_damage_taken: 49,
      location: { name: "dusty-bowl", url: "" },
    });

    expect(
      getConditions(detail, itemNames, moveNames, speciesNames, locationNames),
    ).toEqual(["Take 49 damage", "In Dusty Bowl"]);
  });

  it("shows the raw location name when it has no English name yet", () => {
    const detail = makeDetail({
      location: { name: "mount-lanakila", url: "" },
    });

    expect(
      getConditions(detail, itemNames, moveNames, speciesNames, locationNames),
    ).toEqual(["Level up", "In mount-lanakila"]);
  });
});

describe("getNatureHint", () => {
  const nature = (name: string) => ({ name, url: "" });

  it("names the form and lists the natures (Toxtricity, Amped)", () => {
    const detail = makeDetail({
      evolved_pokemon_form: { name: "toxtricity-amped", url: "" },
      allowed_natures: [nature("hardy"), nature("docile")],
    });

    expect(getNatureHint(detail, "toxtricity")).toEqual({
      line: "Amped nature",
      natures: "Hardy, Docile",
    });
  });

  it("capitalizes every word of a form name (Low Key)", () => {
    const detail = makeDetail({
      evolved_pokemon_form: { name: "toxtricity-low-key", url: "" },
      allowed_natures: [nature("bold")],
    });

    expect(getNatureHint(detail, "toxtricity")?.line).toBe("Low Key nature");
  });

  it("says a specific nature when no form comes out", () => {
    const detail = makeDetail({ allowed_natures: [nature("bold")] });

    expect(getNatureHint(detail, "toxtricity")?.line).toBe("Specific nature");
  });

  it("gives nothing for an entry without natures", () => {
    expect(getNatureHint(makeDetail(), "toxtricity")).toBeNull();
    expect(
      getNatureHint(makeDetail({ allowed_natures: [] }), "toxtricity"),
    ).toBeNull();
  });
});
