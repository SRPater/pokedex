import type { ReactNode } from "react";
import Image from "next/image";

import { getEnglishName, type PokemonSpecies } from "@/lib/pokeapi";
import { getSpriteUrl } from "@/lib/sprites";

import { ButtonLink } from "./Button";

/** A neighbouring species as a button: sprite and number, with the name as a tooltip and for screen readers. */
function NeighbourLink({
  species,
  direction,
  className = "",
}: {
  species: PokemonSpecies;
  direction: "previous" | "next";
  className?: string;
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
      className={`flex items-center gap-3 ${className}`}
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

/**
 * Header row of the detail page: the neighbouring species on both sides and
 * the heading (`children`) in between. Below `md` there is no room for all
 * three, so the heading wraps onto its own line under the two buttons.
 */
export default function DetailHeader({
  previous,
  next,
  children,
}: {
  previous: PokemonSpecies;
  next: PokemonSpecies;
  children: ReactNode;
}) {
  // order-* sets the sequence: previous, next, heading on a phone (the heading's
  // w-full pushes it onto its own line); previous, heading, next from md up.
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-8 md:flex-nowrap">
      <NeighbourLink
        species={previous}
        direction="previous"
        className="order-1"
      />
      <div className="order-3 w-full text-center md:order-2 md:w-auto md:flex-1">
        {children}
      </div>
      <NeighbourLink
        species={next}
        direction="next"
        className="order-2 md:order-3"
      />
    </div>
  );
}
