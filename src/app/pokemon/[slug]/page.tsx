import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getSpecies,
  getPokemonForm,
  getPokemon,
  getPokemonId,
  getEnglishName,
  getFormName,
} from "@/lib/pokeapi";
import Card from "@/components/Card";

export default async function PokemonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ form?: string }>;
}) {
  const { slug } = await params;
  const { form } = await searchParams;

  let species;
  try {
    species = await getSpecies(slug);
  } catch {
    notFound();
  }

  if (slug !== species.name) {
    redirect(`/pokemon/${species.name}`);
  }

  const selected =
    species.varieties.find((v) => v.pokemon.name === form) ??
    species.varieties.find((v) => v.is_default) ??
    species.varieties[0];

  const forms = await Promise.all(
    species.varieties.map((v) => getPokemonForm(v.pokemon.name)),
  );

  const entries = forms.map((form, i) => ({
    key: species.varieties[i].pokemon.name,
    label: getFormName(form, species),
    id: getPokemonId(species.varieties[i].pokemon.url),
  }));

  const selectedLabel = entries.find(
    (entry) => entry.key === selected.pokemon.name,
  )?.label;

  const uniqueEntries = entries.filter(
    (entry, i) => entries.findIndex((e) => e.label === entry.label) === i,
  );

  const otherEntries = uniqueEntries.filter(
    (entry) => entry.key !== selected.pokemon.name,
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-8 pb-8">
      <h1 className="text-center text-3xl font-bold py-8">
        #{String(species.id).padStart(4, "0")} {getEnglishName(species)}
      </h1>
      <Image
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${getPokemonId(selected.pokemon.url)}.png`}
        alt={getEnglishName(species)}
        width={256}
        height={256}
        className="mx-auto"
      />
      {selectedLabel && selectedLabel !== getEnglishName(species) && (
        <p className="mt-2 text-center text-gray-500">{selectedLabel}</p>
      )}
      <div className="mt-8 flex flex-col gap-6">
        {otherEntries.length > 0 && (
          <Card title="Other Forms">
            <div className="flex flex-wrap justify-center gap-6">
              {otherEntries.map((entry) => (
                <Link
                  key={entry.key}
                  href={`/pokemon/${species.name}?form=${entry.key}`}
                >
                  <figure className="flex flex-col items-center">
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry.id}.png`}
                      alt={entry.label}
                      width={128}
                      height={128}
                    />
                    <figcaption className="text-sm">{entry.label}</figcaption>
                  </figure>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
