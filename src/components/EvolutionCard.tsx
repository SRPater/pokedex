import Image from "next/image";
import Link from "next/link";

import type { LinkedStage } from "@/lib/evolution";
import { getSpriteUrl } from "@/lib/sprites";

import Card from "./Card";

/** One stage: sprite and name. The stage that is the page on screen is no link. */
function Stage({ stage, shiny }: { stage: LinkedStage; shiny: boolean }) {
  const figure = (
    <figure className="flex flex-col items-center">
      <Image
        src={getSpriteUrl(stage.id, { shiny })}
        alt=""
        width={96}
        height={96}
      />

      <figcaption className="text-center">
        <span className="text-sm">{stage.label}</span>
        {/* How this stage is reached; empty for the first stage, so nothing shows. */}
        <ul className="text-xs text-gray-500">
          {stage.conditions.map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
          {stage.nature && (
            <li
              title={stage.nature.natures}
              className="cursor-help underline decoration-dotted"
            >
              {stage.nature.line}
            </li>
          )}
        </ul>
      </figcaption>
    </figure>
  );

  // Not being a link is what marks the stage on screen; it needs no other style.
  return stage.current ? figure : <Link href={stage.href}>{figure}</Link>;
}

/**
 * The evolution line(s) of the species: one row per path, each stage a sprite with its
 * name and arrow in between. Rows wrap when they don't fit; the layout for small
 * screens is not decided yet. The conditions are not shown yet either.
 */
export default function EvolutionCard({
  paths,
  shiny,
}: {
  paths: LinkedStage[][];
  shiny: boolean;
}) {
  // A species that doesn't evolve (Ditto) is only paths of one stage: no card at all.
  if (paths.every((path) => path.length < 2)) return null;

  return (
    <Card title="Evolution">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {paths.map((path) => (
          <div
            key={path.map((stage) => stage.form).join(">")}
            className="flex flex-wrap items-start justify-center gap-4 py-3 lg:last:odd:col-span-2 lg:odd:not-last:border-r lg:odd:not-last:border-gray-200 dark:lg:odd:not-last:border-gray-800 lg:odd:not-last:pr-3 lg:even:pl-3"
          >
            {path.map((stage, index) => (
              <div key={stage.form} className="flex items-start gap-4">
                {/* The arrow is decoration; the order of the stages says the rest. */}
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="flex h-24 items-center text-xl text-gray-500"
                  >
                    →
                  </span>
                )}
                <Stage stage={stage} shiny={shiny} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
