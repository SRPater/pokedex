import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getSpecies, getPokemonForm, getPokemon, getPokemonId, getEnglishName, getFormName } from "@/lib/pokeapi";
import Card from "@/components/Card";

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

  const forms = await Promise.all(
    species.varieties.map((v) => getPokemonForm(v.pokemon.name)),
  );
  
  const entries = forms.map((form, i) => ({
    key: form.name,
    label: getFormName(form, species),
    id: getPokemonId(species.varieties[i].pokemon.url),
  }));

  const uniqueEntries = entries.filter(
    (entry, i) => entries.findIndex((e) => e.label === entry.label) === i,
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-8 pb-8">
      <h1 className="text-center text-3xl font-bold py-8">
        #{String(species.id).padStart(4, "0")} {getEnglishName(species)}
      </h1>
      <Image
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${species.id}.png`}
        alt={getEnglishName(species)}
        width={256}
        height={256}
        className="mx-auto"
      />
      <div className="mt-8 flex flex-col gap-6">
        <Card title="Forms">
          <div className="flex flex-wrap justify-center gap-6">
            {uniqueEntries.map((entry) => (
              <figure key={entry.key} className="flex flex-col items-center">
                <Image
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`}
                  alt={entry.label}
                  width={128}
                  height={128}
                />
                <figcaption className="text-sm">{entry.label}</figcaption>
              </figure>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
