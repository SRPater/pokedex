import type { ReactNode } from "react";
import Image from "next/image";
import type { Pokemon, PokemonSpecies } from "@/lib/pokeapi";
import { getIdFromUrl } from "@/lib/pokeapi";
import { getTypeIconUrl } from "@/lib/sprites";
import {
  MAX_CAPTURE_RATE,
  getColorClass,
  formatHeight,
  formatWeight,
  formatSlug,
} from "@/lib/display";
import Card from "./Card";
import StatBar from "./StatBar";
import GenderBar from "./GenderBar";

// One labelled row. The value spans both value columns of the table.
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr>
      <th
        scope="row"
        className="py-2 text-left align-top font-semibold whitespace-nowrap"
      >
        {label}
      </th>
      <td colSpan={2} className="py-2">
        {children}
      </td>
    </tr>
  );
}

/** Facts about the species and the selected form: types, size, abilities, etc. */
export default function OverviewCard({
  species,
  pokemon,
}: {
  species: PokemonSpecies;
  pokemon: Pokemon;
}) {
  return (
    <Card title="Overview">
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-36" />
          <col />
          <col />
        </colgroup>
        <tbody>
          {/* Type row: the table's two value columns hold one icon each */}
          <tr>
            <th scope="row" className="py-2 text-left font-semibold">
              Type
            </th>
            {pokemon.types.map((t) => (
              <td key={t.type.name} className="py-2">
                <Image
                  src={getTypeIconUrl(getIdFromUrl(t.type.url))}
                  alt={t.type.name}
                  width={200}
                  height={40}
                  className="h-6 w-auto"
                />
              </td>
            ))}
          </tr>

          <Row label="Height">{formatHeight(pokemon.height)}</Row>
          <Row label="Weight">{formatWeight(pokemon.weight)}</Row>

          <Row label="Abilities">
            {pokemon.abilities.map((a, i) => (
              <span key={a.ability.name}>
                {i > 0 && " | "}
                <span
                  className={a.is_hidden ? "text-gray-500" : undefined}
                  title={a.is_hidden ? "Hidden ability" : undefined}
                >
                  {formatSlug(a.ability.name)}
                </span>
              </span>
            ))}
          </Row>

          <Row label="Pokédex Color">
            <div className="flex items-center gap-2">
              <span
                className={`h-4 w-4 rounded border border-gray-400 ${getColorClass(species.color.name)}`}
                aria-hidden="true"
              />
              {formatSlug(species.color.name)}
            </div>
          </Row>

          <Row label="Capture Rate">
            <div className="flex items-center gap-3">
              <span className="w-8">{species.capture_rate}</span>
              <div className="flex-1">
                <StatBar value={species.capture_rate} max={MAX_CAPTURE_RATE} />
              </div>
            </div>
          </Row>

          <Row label="Gender Ratio"><GenderBar genderRate={species.gender_rate} /></Row>
        </tbody>
      </table>
    </Card>
  );
}
