import Image from "next/image";

import type { PokemonSpecies } from "@/lib/pokeapi";
import { getEnglishName } from "@/lib/pokeapi";
import { getSpriteUrl } from "@/lib/sprites";

import { ButtonLink } from "./Button";

function NeighbourLink({
  species,
  direction,
}: {
  species: PokemonSpecies;
  direction: "previous" | "next";
}) {
  const number = `#${String(species.id).padStart(4, "0")}`;
  const name = getEnglishName(species);
  const arrow = (
    <span aria-hidden="true" className="text-xl">
      {direction === "previous" ? "←" : "→"}
    </span>
  );

  return (
    <ButtonLink
      href={`/pokemon/${species.name}`}
      title={`${number} ${name}`}
      className="flex items-center gap-3"
    >
      {direction === "previous" && arrow}
      <span className="flex flex-col items-center">
        <Image src={getSpriteUrl(species.id)} alt="" width={48} height={48} />
        <span className="text-xs text-gray-500">{number}</span>
      </span>
      {direction === "next" && arrow}
      <span className="sr-only">
        {direction === "previous" ? "Previous: " : "Next: "}
        {name}
      </span>
    </ButtonLink>
  );
}

/** Links to the neighbouring species in Pokédex order (wrapping around). */
export default function PokemonNav({
  previous,
  next,
}: {
  previous: PokemonSpecies;
  next: PokemonSpecies;
}) {
  return (
    <nav
      aria-label="Neighbouring Pokémon"
      className="flex justify-between gap-4 pt-8"
    >
      <NeighbourLink species={previous} direction="previous" />
      <NeighbourLink species={next} direction="next" />
    </nav>
  );
}
