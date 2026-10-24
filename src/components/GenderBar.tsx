/**
 * Male/female split as percentages around a two-colour bar. `genderRate` is
 * the number of eighths that are female (0 to 8), or -1 for genderless species.
 */
export default function GenderBar({ genderRate }: { genderRate: number }) {
  // Genderless species (e.g. Magnemite, most legendaries) have no ratio to show.
  // "Gender unknown" is the wording Bulbapedia uses for these.
  if (genderRate === -1) {
    return <span>Gender unknown</span>;
  }

  const female = (genderRate / 8) * 100;
  const male = 100 - female;

  return (
    <div className="flex items-center gap-3">
      <span className="w-12">
        {male}%<span className="sr-only"> male</span>
      </span>
      <div
        className="flex h-2 flex-1 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <div className="bg-blue-500" style={{ width: `${male}%` }} />
        <div className="bg-pink-400" style={{ width: `${female}%` }} />
      </div>
      <span className="w-12 text-right">
        {female}%<span className="sr-only"> female</span>
      </span>
    </div>
  );
}
