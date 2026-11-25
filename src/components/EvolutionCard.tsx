import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import type { LinkedStage } from "@/lib/evolution";
import { getSpriteUrl } from "@/lib/sprites";

import Card from "./Card";

/**
 * One stage: sprite, name and conditions. The stage that is the page on screen is no
 * link. Its width is the row's sprite size (--s, set on the row), so the sprites of a
 * row are all equally big; the caption may be a little wider than the sprite, so a name
 * like "Charmander" doesn't break in the middle of a word.
 */
function Stage({ stage, shiny }: { stage: LinkedStage; shiny: boolean }) {
  const figure = (
    <figure className="flex flex-col items-center">
      <Image
        src={getSpriteUrl(stage.id, { shiny })}
        alt=""
        width={96}
        height={96}
        className="h-auto w-full"
      />
      <figcaption className="w-[calc(100%+1rem)] text-center">
        <span className="break-words text-xs sm:text-sm">{stage.label}</span>
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

  const itemClass = "w-(--s) shrink-0";

  // Not being a link is what marks the stage on screen; it needs no other style.
  return stage.current ? (
    <div className={itemClass}>{figure}</div>
  ) : (
    <Link href={stage.href} className={itemClass}>
      {figure}
    </Link>
  );
}

/**
 * The evolution line(s) of the species: one row per path, each stage a sprite with its
 * name and the conditions under it, and an arrow between the stages. The sprite size
 * (--s) follows the screen width, from 56px on a small phone up to 96px, and the
 * arrow is as high as the sprite, so it stays centered on it and never overlaps it.
 * From lg up the rows sit in two columns with a thin line between them, and a row that
 * is alone, or the last of an odd number, spans both and is centered.
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
            className="flex items-start justify-center gap-1 py-3 [--s:clamp(3.5rem,19vw,6rem)] lg:last:odd:col-span-2 lg:odd:not-last:border-r lg:odd:not-last:border-gray-200 lg:odd:not-last:pr-3 lg:even:pl-3 dark:lg:odd:not-last:border-gray-800"
          >
            {path.map((stage, index) => (
              <Fragment key={stage.form}>
                {/* The arrow is decoration; the order of the stages says the rest. */}
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="flex h-(--s) w-6 shrink-0 items-center justify-center text-xl text-gray-500"
                  >
                    →
                  </span>
                )}
                <Stage stage={stage} shiny={shiny} />
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
