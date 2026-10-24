/** Placeholder rows shown while a page of the Pokémon list is loading. */
export default function PokemonTableSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="h-16 even:bg-gray-100 dark:even:bg-gray-900" />
      ))}
    </div>
  );
}
