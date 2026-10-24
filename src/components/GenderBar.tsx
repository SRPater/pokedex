export default function GenderBar({ genderRate }: { genderRate: number}) {
  if (genderRate === -1) {
    return <span>Gender unknown</span>;
  }

  const female = (genderRate / 8) * 100;
  const male = 100 - female;

  return (
    <div className="flex items-center gap-3">
      <span className="w-12">
        {male}%<span className="sr-only"> male</span>
      </span>
      <div
        className="flex h-2 flex-1 overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <div className="bg-blue-500" style={{ width: `${male}%`}} />
        <div className="bg-pink-400" style={{ width: `${female}%`}} />
      </div>
      <span className="w-12 text-right">
        {female}%<span className="sr-only"> female</span>
      </span>
    </div>
  );
}
