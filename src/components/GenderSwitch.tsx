import Link from "next/link";

/** Male/female switch under the artwork, for species with gender varieties. */
export default function GenderSwitch({
  selected,
  maleHref,
  femaleHref,
}: {
  selected: "male" | "female";
  maleHref: string;
  femaleHref: string;
}) {
  // Work out which variety is the male one and which the female one.
  const options = [
    { symbol: "♂", label: "Male", href: maleHref, isSelected: selected === "male" },
    { symbol: "♀", label: "Female", href: femaleHref, isSelected: selected === "female" },
  ];

  return (
    <div className="mt-4 flex justify-center">
      <div className="inline-flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-950">
        {options.map((option) =>
          option.isSelected ? (
            <span
              key={option.label}
              aria-current="true"
              className="rounded-md bg-gray-200 px-3 py-1 font-semibold dark:bg-gray-800"
            >
              {option.symbol}
              <span className="sr-only"> {option.label}</span>
            </span>
          ) : (
            <Link
              key={option.label}
              href={option.href}
              className="rounded-md px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              {option.symbol}
              <span className="sr-only"> {option.label}</span>
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
