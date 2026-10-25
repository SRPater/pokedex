import { ButtonLink } from "@/components/Button";

// Landing page for /. Deliberately minimal for now.
export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-8 py-24 text-center">
      <h1 className="text-4xl font-bold">Pokédex</h1>
      <p className="mt-4 text-gray-500">
        Browse every Pokémon species: stats, types, abilities and alternate
        forms, powered by PokéAPI.
      </p>
      <div className="mt-8">
        <ButtonLink href="/pokemon">Browse the Pokédex</ButtonLink>
      </div>
    </div>
  );
}
