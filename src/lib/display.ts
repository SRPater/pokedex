export const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Special Attack",
  "special-defense": "Special Defense",
  speed: "Speed",
};

export const MAX_STAT = 200;
export const MAX_TOTAL = 800;

export function formatHeight(decimetres: number): string {
  const metric = (decimetres / 10).toFixed(1);
  const totalInches = Math.round(decimetres * 3.93701);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  const imperial = `${feet}'${String(inches).padStart(2, "0")}"`;

  return `${metric} m | ${imperial}`;
}

export function formatWeight(hectograms: number): string {
  if (hectograms === 0) return "???.? kg | ????.? lbs";
  
  const metric = (hectograms / 10).toFixed(1);
  const imperial = (hectograms * 0.220462).toFixed(1);

  return `${metric} kg | ${imperial} lbs`;
}

export function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
