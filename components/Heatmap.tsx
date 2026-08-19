"use client";

import { useState } from "react";
import { addDays, fromKey, formatMD, WEEKDAYS_JA } from "@/lib/date";
import { heatLevel } from "@/lib/stats";
import type { DayLog } from "@/lib/types";
import { fmtTokensM } from "@/lib/format";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";

interface Props {
  logs: Record<string, DayLog>;
  today: string;
  weeks?: number;
}

const LEVEL_VAR = ["--heat-0", "--heat-1", "--heat-2", "--heat-3", "--heat-4", "--heat-5"];

export function Heatmap({ logs, today, weeks = 16 }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  // 今日を含む週の土曜まで埋める（GitHub風: 列=週, 行=日〜土）
  const todayD = fromKey(today);
  const endKey = addDays(today, 6 - todayD.getUTCDay());
  const total = weeks * 7;
  const startKey = addDays(endKey, -(total - 1));

  const cols: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: string[] = [];
    for (let d = 0; d < 7; d++) col.push(addDays(startKey, w * 7 + d));
    cols.push(col);
  }
  // 月ラベル（各列の最初の日の月が変わったら表示）
  const monthLabels = cols.map((col, i) => {
    const m = fromKey(col[0]).getUTCMonth();
    const prev = i > 0 ? fromKey(cols[i - 1][0]).getUTCMonth() : -1;
    return m !== prev ? `${m + 1}月` : "";
  });

  const loggedInRange = cols.flat().filter((k) => (logs[k]?.hours ?? 0) > 0).length;
  const h = hover ? logs[hover] : undefined;

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-ink">Claude活動ヒートマップ</h3>
          <p className="mt-0.5 text-xs text-ink-3">直近{weeks}週・{loggedInRange}日稼働。濃いほど上限ギリギリ</p>
        </div>
        <ClaudeBuddy size={44} mood="happy" prop="flag" />
      </div>

      <div className="relative mt-4 overflow-x-auto">
        <div className="min-w-[260px]">
          <div
            className="grid gap-[3px] text-[9px] text-ink-3"
            style={{ gridTemplateColumns: `18px repeat(${weeks}, minmax(0,1fr))` }}
          >
            <div />
            {monthLabels.map((m, i) => (
              <div key={i} className="truncate">
                {m}
              </div>
            ))}
          </div>
          <div
            className="mt-1 grid gap-[3px]"
            style={{
              gridTemplateColumns: `18px repeat(${weeks}, minmax(0,1fr))`,
              gridTemplateRows: "repeat(7, auto)",
              gridAutoFlow: "column",
            }}
          >
            {Array.from({ length: 7 }).map((_, row) => (
              <div key={`l${row}`} className="flex h-full items-center text-[9px] font-bold text-ink-3">
                {row === 1 ? "月" : row === 3 ? "水" : row === 5 ? "金" : ""}
              </div>
            ))}
            {cols.flat().map((k) => {
              const l = logs[k];
              const lv = heatLevel(l);
              const future = k > today;
              const isToday = k === today;
              return (
                <button
                  key={k}
                  type="button"
                  onMouseEnter={() => setHover(k)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(k)}
                  onBlur={() => setHover(null)}
                  aria-label={`${formatMD(k)} ${l ? `${l.hours.toFixed(1)}時間` : "記録なし"}`}
                  className={`aspect-square w-full rounded-[4px] transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
                    future ? "opacity-0 pointer-events-none" : ""
                  } ${isToday ? "ring-2 ring-ink/70 ring-offset-1" : ""}`}
                  style={{ background: `var(${LEVEL_VAR[lv]})` }}
                  disabled={future}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-3">
        <div className="min-h-[18px] font-bold text-ink">
          {hover ? (
            h ? (
              <>
                {formatMD(hover)}（{WEEKDAYS_JA[fromKey(hover).getUTCDay()]}）: {h.hours.toFixed(1)}h ／ {fmtTokensM(h.tokensM)}
              </>
            ) : (
              <>{formatMD(hover)}: 記録なし</>
            )
          ) : (
            <span className="font-medium text-ink-3">タイルにカーソルを合わせると詳細を表示</span>
          )}
        </div>
        <div className="inline-flex items-center gap-1">
          少
          {LEVEL_VAR.map((v) => (
            <span key={v} className="inline-block h-3 w-3 rounded-[3px]" style={{ background: `var(${v})` }} />
          ))}
          多
        </div>
      </div>
    </div>
  );
}

