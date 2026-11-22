import type { EvolutionDetail } from "./pokeapi";
import { parseVariety } from "./variety";

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// The API's times of day as the short line to show.
const TIME_LABELS: Record<string, string> = {
  day: "Daytime",
  night: "Nighttime",
  dusk: "Dusk",
};

// Triggers with fixed lines of their own, because the API only has the trigger's name.
// They are written by hand. Only "spin" is the whole condition (see getConditions); the
// others are followed by the entry's other fields, like a held item.
const TRIGGER_LABELS: Record<string, string[]> = {
  shed: ["Empty party slot", "Poké Ball in bag"],
  spin: ["Spin with a Sweet"],
  "tower-of-darkness": ["Tower of Darkness"],
  "tower-of-waters": ["Tower of Waters"],
  "three-critical-hits": ["3 critical hits in one battle"],
  "three-defeated-bisharp": ["Defeat 3 leader Bisharp"],
  "gimmighoul-coins": ["999 Gimmighoul Coins"],
  "meltan-candies": ["400 Meltan Candies"],
  "agile-style-move": ["Agile Style"],
  "strong-style-move": ["Strong Style"],
  "use-move": ["Level up"],
};

/**
 * The short lines that say how an entry is reached, one per condition: "Level 16",
 * "Thunder Stone", "Trade", "Holding Dragon Scale", "Friendship", "Daytime". A level-up
 * always starts with "Level up" or its level. Some triggers have fixed lines of their
 * own (Shedinja's shed); Alcremie's spin is the whole condition, so the other fields of
 * its entry are not shown. Only some fields are covered so far; the natures are still
 * missing, so an entry that needs them shows fewer lines than it should for now.
 * `itemNames`, `moveNames`, `speciesNames` and `locationNames` map the API's names to
 * their English names; a missing name shows the raw one, so a gap never hides a
 * condition.
 */
export function getConditions(
  detail: EvolutionDetail,
  itemNames: Map<string, string>,
  // Defaults to an empty map so callers without move names (and the older tests) still
  // work: a missing name shows the raw one.
  moveNames: Map<string, string> = new Map(),
  // Same idea as moveNames: the API's species name to its English name, empty by default.
  speciesNames: Map<string, string> = new Map(),
  // Same idea as the other name maps: the API's location name to its English name.
  locationNames: Map<string, string> = new Map(),
): string[] {
  // Alcremie's 63 entries are merged into one path (see collapseUnknownForms), so the
  // fields of the one that is left (a Sweet, a time of day) would be wrong for the
  // others: only the spin line is shown.
  if (detail.trigger.name === "spin") return TRIGGER_LABELS.spin;

  const lines: string[] = [];

  // The trigger says what kind of evolution this is; the other fields refine it.
  switch (detail.trigger.name) {
    // A level-up always says so, with the level when there is one. Without it, "Holding
    // Razor Fang" and "Nighttime" (Gliscor) would read as if holding the item at night
    // were enough.
    case "level-up":
      lines.push(`Level ${detail.min_level ?? "up"}`);
      break;
    case "use-item":
      if (detail.item) {
        lines.push(itemNames.get(detail.item.name) ?? detail.item.name);
      } else {
        lines.push("Use an item");
      }

      break;
    case "trade":
      lines.push(
        detail.trade_species
          ? `Trade for ${speciesNames.get(detail.trade_species.name) ?? detail.trade_species.name}`
          : "Trade",
      );
      break;
    // The damage number is what tells these apart from each other and from the plain
    // generic wording below, so it is part of the line. Without a number, only the
    // generic wording is left.
    case "take-damage":
      lines.push(
        detail.min_damage_taken
          ? `Take ${detail.min_damage_taken} damage`
          : "Take damage",
      );
      break;
    case "recoil-damage":
      lines.push(
        detail.min_damage_taken
          ? `Take ${detail.min_damage_taken} recoil damage`
          : "Take recoil damage",
      );
      break;
    // Tandemaus: a level-up during battle. Said like the plain level-up, with the level
    // when there is one.
    case "in-battle-level-up":
      lines.push(`Level ${detail.min_level ?? "up"} in battle`);
      break;
    // A trigger without a label of its own yet: its name as words. Proper labels
    // for all 18 triggers come later.
    default: {
      const fixed = TRIGGER_LABELS[detail.trigger.name];
      // A trigger with fixed lines uses them; any other has no label of its own yet, so
      // its name as words. Proper labels for all 18 triggers come later.
      if (fixed) {
        for (const line of fixed) lines.push(line);
      } else {
        const words = detail.trigger.name.split("-");
        words[0] = capitalize(words[0]);
        lines.push(words.join(" "));
      }
      break;
    }
  }

  // An item the Pokémon holds (Kingdra's Dragon Scale), apart from the one a "use-item"
  // trigger uses. It comes after the trigger's own lines, so a trade reads "Trade",
  // then "Holding Dragon Scale".
  if (detail.held_item)
    lines.push(
      `Holding ${itemNames.get(detail.held_item.name) ?? detail.held_item.name}`,
    );

  // Moves: one that has to be known (Mamoswine), a type of move (Sylveon), or one that
  // has to be used a number of times (Wyrdeer, Annihilape). Annihilape's "use-move" is
  // a level-up after using the move, so its fixed line says so. The two style triggers
  // (Wyrdeer, Overqwil) are not: using the move in that style is the whole evolution,
  // with no level-up.
  if (detail.known_move)
    lines.push(
      `Knowing ${moveNames.get(detail.known_move.name) ?? detail.known_move.name}`,
    );

  if (detail.known_move_type)
    lines.push(
      `Knowing a ${capitalize(detail.known_move_type.name)}-type move`,
    );

  if (detail.used_move) {
    const name = moveNames.get(detail.used_move.name) ?? detail.used_move.name;
    lines.push(
      `Use ${name}${detail.min_move_count ? " " + detail.min_move_count + " times" : ""}`,
    );
  }

  if (detail.min_happiness) lines.push("Friendship");
  if (detail.time_of_day !== "")
    lines.push(TIME_LABELS[detail.time_of_day] ?? detail.time_of_day);

  // Only some evolutions depend on gender (Gallade needs a male Kirlia, Salazzle a
  // female Salandit). The API's gender IDs are 1 for female and 2 for male.
  if (detail.gender === 1) lines.push("Female");
  if (detail.gender === 2) lines.push("Male");

  // Not tied to a trigger: ito nly matters that the entry asks for steps.
  if (detail.min_steps) lines.push(`Walk ${detail.min_steps} steps`);

  // The small conditions that need no names from the API. Each shows only when the entry
  // sets it; the API sends all of them, with null or false for "doesn't apply". Only
  // fields that a current entry uses are here (checked against the CSV, is_default = 1).
  if (detail.relative_physical_stats === 1)
    lines.push("Attack higher than Defense");

  if (detail.relative_physical_stats === -1)
    lines.push("Defense higher than Attack");

  if (detail.relative_physical_stats === 0)
    lines.push("Attack equal to Defense");

  if (detail.needs_overworld_rain) lines.push("While raining");
  if (detail.turn_upside_down) lines.push("Console upside down");
  if (detail.needs_multiplayer) lines.push("In a Union Circle");
  if (detail.region) lines.push(`In ${capitalize(detail.region.name)}`);
  if (detail.party_type)
    lines.push(`${capitalize(detail.party_type.name)}-type in party`);

  // A species in the party (Mantine needs a Remoraid). It needs a name from theAPI, so
  // it is separate from the small conditions above.
  if (detail.party_species)
    lines.push(
      `${speciesNames.get(detail.party_species.name) ?? detail.party_species.name} in party`,
    );

  // A place (Runerigus: Dusty Bowl). Like the species names, it needs a name from the API.
  if (detail.location)
    lines.push(
      `In ${locationNames.get(detail.location.name) ?? detail.location.name}`,
    );

  // The chance comes last, after the other conditions: "Level 7", then "50% chance". It
  // is what tells Maushold's two entries (99% and 1%) apart. Entries without a chance
  // have `null` here, so nothing is added.
  if (detail.condition_expression?.percentage_chance)
    lines.push(`${detail.condition_expression.percentage_chance}% chance`);

  return lines;
}

/**
 * A nature condition for a stage: the short line ("Amped nature") and the full list of
 * natures for a tooltip. It is kept apart from the other lines, which are plain strings,
 * because it carries extra text.
 */
export type NatureHint = {
  line: string;
  natures: string;
};

/**
 * The nature condition of an entry, or null when it has none (only Toxel -> Toxtricity,
 * today). Amped and Low Key each accept about a dozen natures, too many to list under a
 * sprite, so the line only names the form and the list goes in a tooltip. The name comes
 * from the form that comes out ("toxtricity-low-key" gives "Low Key"); without one, the
 * line says "Specific nature".
 */
export function getNatureHint(
  detail: EvolutionDetail,
  species: string,
): NatureHint | null {
  if (detail.allowed_natures === null || detail.allowed_natures.length === 0)
    return null;

  const form = detail.evolved_pokemon_form
    ? parseVariety(species, detail.evolved_pokemon_form.name).form
    : null;

  const words = form
    ? form
        .split("-")
        .map((word) => capitalize(word))
        .join(" ")
    : "Specific";
  
  return {
    line: `${words} nature`,
    natures: detail.allowed_natures.map((nature) => capitalize(nature.name)).join(", "),
  };
}
