// Placeholder for /pokemon/[slug] while its data loads. The blocks roughly match
// the real layout (heading, artwork, two cards), so the page doesn't jump.
export default function Loading() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pb-8 animate-pulse">
      <div className="mx-auto mt-8 h-9 w-64 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mx-auto mt-4 h-6 w-40 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mx-auto mt-8 h-64 w-64 rounded-xl bg-gray-200 dark:bg-gray-800" />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-96 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-96 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
