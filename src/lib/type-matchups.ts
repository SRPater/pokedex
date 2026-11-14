import type { DamageFrom } from "./pokeapi";

/**
 * Damage multiplier per attacking type against a Pokémon with these types (one or
 * two). A type missing from the map takes normal damage (x1). An entry can also be
 * 1 (a weakness cancelled by a resistance), so callers should skip those.
 */
export function combineMatchups(
  defenderTypes: DamageFrom[],
): Map<string, number> {
  const result = new Map<string, number>();

  // Multiply type by type: a second type multiplies whatever the first one gave.
  // The factors are only 0, 0.5 and 2, so every product is exact (no rounding
  // errors), and once an immunity makes it 0 it stays 0, so immunity beats weakness.
  const apply = (attackers: string[], factor: number) => {
    for (const attacker of attackers) {
      result.set(attacker, (result.get(attacker) ?? 1) * factor);
    }
  };

  for (const type of defenderTypes) {
    apply(type.double, 2);
    apply(type.half, 0.5);
    apply(type.none, 0);
  }

  return result;
}
