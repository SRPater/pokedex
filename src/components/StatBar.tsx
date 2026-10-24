/**
 * Bar showing `value` as a share of `max`, coloured by tier: red under 25%,
 * orange under 50%, yellow under 75%, green above. It's decorative (the number
 * is shown next to it), so it's hidden from screen readers.
 */
export default function StatBar({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const ratio = Math.min(value / max, 1);

  // Full class names on purpose: Tailwind can only generate classes it finds as literal strings.
  const color =
    ratio < 0.25
      ? "bg-red-500"
      : ratio < 0.5
        ? "bg-orange-500"
        : ratio < 0.75
          ? "bg-yellow-500"
          : "bg-green-500";

  return (
    <div
      className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800"
      aria-hidden="true"
    >
      <div
        className={`h-2 rounded-full ${color}`}
        // The width must be an inline style, since Tailwind can't make a class from a runtime value.
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
