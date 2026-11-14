import Image from "next/image";

import { formatMultiplier } from "@/lib/display";
import { getTypeId } from "@/lib/pokeapi";
import type { TypeMatchupEntry, TypeMatchups } from "@/lib/pokemon-detail";
import { getSmallTypeIconUrl, getTypeIconUrl } from "@/lib/sprites";

import Card from "./Card";

// One column of the card. Immunities pass showMultiplier={false}: the heading
// already says "Immune To", so a "x0" next to every icon would repeat it.
function MatchupColumn({
  title,
  entries,
}: {
  title: string;
  entries: TypeMatchupEntry[];
}) {
  return (
    <div className="text-center">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {entries.length === 0 ? (
        <p className="text-gray-500">None</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => {
            const id = getTypeId(entry.name);
            return (
              <li key={entry.name} className="flex items-center justify-center gap-2">
                {/* Both icons are in the markup and CSS picks one: small below md,
                    wide form md up. That needs no client state. The hidden one
                    isn't shown, and the images are lazy, so it shouldn't be fetched. */}
                <Image
                  src={getSmallTypeIconUrl(id)}
                  alt={entry.name}
                  width={60}
                  height={60}
                  className="h-6 w-6 md:hidden"
                />
                <Image
                  src={getTypeIconUrl(id)}
                  alt={entry.name}
                  width={200}
                  height={40}
                  className="hidden h-6 w-auto md:block"
                />
                {/* Immunities (x) show no multiplier: the "Immune To" heading says it. */}
                {entry.multiplier > 0 && (
                  <span>{formatMultiplier(entry.multiplier)}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** What the selected form is weak to, resists and is immune to, grouped by strength. */
export default function TypeMatchupsCard({
  matchups,
}: {
  matchups: TypeMatchups;
}) {
  return (
    <Card title="Type Matchups">
      <div className="grid grid-cols-3 gap-4">
        <MatchupColumn title="Weak To" entries={matchups.weak} />
        <MatchupColumn title="Resists" entries={matchups.resists} />
        <MatchupColumn title="Immune To" entries={matchups.immune} />
      </div>
    </Card>
  );
}
