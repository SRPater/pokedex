import Link from "next/link";

// Styled like GenderSwitch, but stacked vertically. The shiny state lives in the URL
// (?shiny=true), so the side that isn't selected is a link to the same page with the
// parameter flipped. The page builds `href`, so this component doesn't need to know
// the other query parameters.
export default function ShinyToggle({
  shiny,
  href,
}: {
  shiny: boolean;
  href: string;
}) {
  const options = [
    { symbol: "✨", label: "Shiny", isSelected: shiny },
    { symbol: "❌", label: "Normal", isSelected: !shiny },
  ];

  return (
    <div className="inline-flex flex-col gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-950">
      {options.map((option) =>
        option.isSelected ? (
          <span
            key={option.label}
            aria-current="true"
            className="rounded-md bg-gray-200 px-3 py-1 text-center font-semibold dark:bg-gray-800"
          >
            {option.symbol}
            <span className="sr-only"> {option.label}</span>
          </span>
        ) : (
          <Link
            key={option.label}
            href={href}
            // Keep the scroll position; otherwise the page jumps to the top on every toggle.
            scroll={false}
            className="rounded-md px-3 py-1 text-center hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            {option.symbol}
            <span className="sr-only"> {option.label}</span>
          </Link>
        ),
      )}
    </div>
  );
}
