import { notFound, redirect } from "next/navigation";
import { getSpecies, getEnglishName } from "@/lib/pokeapi";

export default async function PokemonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let species;
  try {
    species = await getSpecies(slug);
  } catch {
    notFound();
  }

  if (slug !== species.name) {
    redirect(`/pokemon/${species.name}`);
  }

  return (
    <h1 className="text-3xl font-bold p-8">
      #{String(species.id).padStart(4, "0")} {getEnglishName(species)}
    </h1>
  );
}
