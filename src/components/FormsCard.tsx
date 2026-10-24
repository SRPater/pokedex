import Image from "next/image";
import Link from "next/link";
import { getArtworkUrl } from "@/lib/sprites";
import Card from "./Card";

export type FormEntry = {
  /** The variety's slug, used in the ?form= URL parameter. */
  key: string;
  /** English display name, e.g. "Mega Charizard X". */
  label: string;
  /** Pokémon ID of this form, used for its artwork. */
  id: number;
};

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
