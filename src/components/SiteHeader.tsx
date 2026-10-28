import Link from "next/link";

/** Top bar on every page: home link and navigation. */
export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex w-full max-w-5xl items-center gap-6 px-4 md:px-8 py-4">
        <Link href="/" className="text-lg font-bold">
          Pokédex
        </Link>
        <Link
          href="/pokemon"
          className="rounded-lg px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-900"
        >
          All Pokémon
        </Link>
      </nav>
    </header>
  );
}
