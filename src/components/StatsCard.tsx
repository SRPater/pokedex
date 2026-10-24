import type { Pokemon } from "@/lib/pokeapi";
import { MAX_STAT, MAX_TOTAL, getStatLabel } from "@/lib/display";
import Card from "./Card";
import StatBar from "./StatBar";

/** Base stats of the selected form, each with a coloured bar, plus the total. */
export default function StatsCard({ stats }: { stats: Pokemon["stats"] }) {
  const total = stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <Card title="Base Stats">
      <table className="w-full">
        <tbody>
          {stats.map((s) => (
            <tr key={s.stat.name}>
              <th
                scope="row"
                className="py-2 pr-4 text-left font-semibold whitespace-nowrap"
              >
                {getStatLabel(s.stat.name)}
              </th>
              <td className="py-2 text-right">{s.base_stat}</td>
              <td className="w-full py-2 pl-4">
                <StatBar value={s.base_stat} max={MAX_STAT} />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 dark:border-gray-800">
            <th scope="row" className="py-2 text-left font-semibold">
              Total
            </th>
            <td className="py-2 text-right font-semibold">{total}</td>
            <td className="w-full py-2 pl-4">
              <StatBar value={total} max={MAX_TOTAL} />
            </td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}
