// Presentation helpers: labels, bar scales and formatters that decide how raw
// PokéAPI data is displayed. Nothing in here fetches anything.

// Scales for the bars; a value above its max just shows a full bar.
// 200 and 800 put the colour tiers (25/50/75%) on round numbers, and 255 is
// the highest possible capture rate.
export const MAX_STAT = 200;
export const MAX_TOTAL = 800;
export const MAX_CAPTURE_RATE = 255;

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Special Attack",
  "special-defense": "Special Defense",
  speed: "Speed",
};

export function getStatLabel(slug: string): string {
  return STAT_LABELS[slug] ?? formatSlug(slug);
}

// Keys are PokéAPI's Pokédex colour names. The classes must stay complete
// literal strings, or Tailwind won't generate them.
const COLOR_CLASSES: Record<string, string> = {
  black: "bg-black",
  blue: "bg-blue-500",
  brown: "bg-amber-800",
  gray: "bg-gray-500",
  green: "bg-green-500",
  pink: "bg-pink-400",
  purple: "bg-purple-500",
  red: "bg-red-500",
  white: "bg-white",
  yellow: "bg-yellow-400",
};

export function getColorClass(color: string): string {
  return COLOR_CLASSES[color] ?? "bg-gray-300";
}

/** PokéAPI stores height in decimetres. Returns e.g. "1.7 m | 5'07"". */
export function formatHeight(decimetres: number): string {
  const metric = (decimetres / 10).toFixed(1);
  // Round to whole inches before splitting, so we never get 5'12".
  const totalInches = Math.round(decimetres * 3.93701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const imperial = `${feet}'${String(inches).padStart(2, "0")}"`;

  return `${metric} m | ${imperial}`;
}

/** PokéAPI stores weight in hectograms. Returns e.g. "6.0 kg | 13.2 lbs". */
export function formatWeight(hectograms: number): string {
  // 0 is a placeholder in the data (e.g. Eternamax Eternatus), not a real weight.
  // The placeholder mirrors how other sites show it.
  if (hectograms === 0) return "???.? kg | ????.? lbs";

  const metric = (hectograms / 10).toFixed(1);
  const imperial = (hectograms * 0.220462).toFixed(1);

  return `${metric} kg | ${imperial} lbs`;
}

/** "tough-claws" -> "Tough Claws". Names with punctuation ("Mind's Eye") won't come out right. */
export function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
