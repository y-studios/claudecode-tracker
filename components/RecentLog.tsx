import { formatMD, weekdayOf } from "@/lib/date";
import { LIMIT_HOURS, type DayLog } from "@/lib/types";
import { fmtTokensM } from "@/lib/format";
import { REACH_HOURS } from "@/lib/stats";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";

interface Props {
  logs: Record<string, DayLog>;
  today: string;
}

export function RecentLog({ logs, today }: Props) {
  const keys = Object.keys(logs).sort().reverse().slice(0, 21);
  const maxHours = Math.max(LIMIT_HOURS, ...keys.map((k) => logs[k].hours));

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-ink">直近ログ</h3>
          <p className="mt-0.5 text-xs text-ink-3">実測値。1時間ごとに自動更新（手動編集はできません）</p>
        </div>
        <ClaudeBuddy size={44} mood="cool" />
      </div>

      {keys.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
          <ClaudeBuddy size={90} mood="sleepy" prop="coffee" />
          <p className="text-sm font-bold text-ink-2">まだ実測ログがありません</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line/70">
          {keys.map((k) => {
            const l = logs[k];
            const pct = Math.min(1, l.hours / maxHours);
            return (
              <li key={k} className="flex items-center gap-3 py-2.5">
                <div className="w-[72px] shrink-0 leading-tight">
                  <div className="text-sm font-black text-ink">
                    {formatMD(k)}
                    <span className="ml-0.5 text-[10px] font-bold text-ink-3">({weekdayOf(k)})</span>
                  </div>
                  {k === today && <div className="text-[10px] font-bold text-clay">今日</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory-2">
                      <div
                        className={`h-full rounded-full ${l.hours >= LIMIT_HOURS ? "bg-clay-deep" : l.hours >= REACH_HOURS ? "bg-orange" : "bg-[#fbb36f]"}`}
                        style={{ width: `${pct * 100}%` }}
                      />
                    </div>
                    <span className="num w-14 text-right text-sm text-ink">{l.hours.toFixed(1)}h</span>
                    <span className="num hidden w-16 text-right text-xs text-ink-3 sm:block">{fmtTokensM(l.tokensM)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
