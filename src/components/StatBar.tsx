export default function StatBar({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const ratio = Math.min(value / max, 1);
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
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}
