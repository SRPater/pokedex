import Image from "next/image";
import Link from "next/link";

import type { FormEntry } from "@/lib/pokemon-detail";
import { getArtworkUrl } from "@/lib/sprites";

import Card from "./Card";

/** The species' other forms; each links to its page via the entry's `href`. */
export default function FormsCard({
  entries,
  shiny,
}: {
  entries: FormEntry[];
  shiny: boolean;
}) {
  // Nothing to offer (e.g. Ditto, Koraidon): no card at all.
  if (entries.length === 0) return null;

  return (
    <Card title="Other Forms">
      <div className="flex flex-wrap justify-center gap-6">
        {entries.map((entry) => (
          <Link key={entry.key} href={entry.href}>
            <figure className="flex flex-col items-center">
              <Image
                src={getArtworkUrl(entry.id, { shiny })}
                alt=""
                width={128}
                height={128}
              />
              <figcaption className="text-sm">{entry.label}</figcaption>
            </figure>
          </Link>
        ))}
      </div>
    </Card>
  );
}
