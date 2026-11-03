/** Placeholder rows shown while a page of the Pokémon list is loading. */
export default function PokemonTableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      {Array.from({ length: rows }, (_, i) => (
        // h-16 matches the height of a real table row, so the page doesn't jump when the data arrives.
        <div key={i} className="h-16 even:bg-gray-100 dark:even:bg-gray-900" />
      ))}
    </div>
  );
}
