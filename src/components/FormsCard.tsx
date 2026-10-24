import Image from "next/image";
import Link from "next/link";

import type { FormEntry } from "@/lib/pokemon-detail";
import { getArtworkUrl } from "@/lib/sprites";

import Card from "./Card";

/** The species' other forms; each links to the same page with ?form= set. */
export default function FormsCard({
  speciesName,
  entries,
}: {
  speciesName: string;
  entries: FormEntry[];
}) {
  // Species with a single form (e.g. Ditto) get no card at all.
  if (entries.length === 0) return null;

  return (
    <Card title="Other Forms">
      <div className="flex flex-wrap justify-center gap-6">
        {entries.map((entry) => (
          <Link
            key={entry.key}
            href={`/pokemon/${speciesName}?form=${entry.key}`}
          >
            <figure className="flex flex-col items-center">
              <Image
                src={getArtworkUrl(entry.id)}
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
  );
}
