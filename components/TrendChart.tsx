"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMD, lastNDays, fromKey, WEEKDAYS_JA } from "@/lib/date";
import { LIMIT_HOURS, type DayLog } from "@/lib/types";
import { REACH_HOURS } from "@/lib/stats";
import { fmtTokensM } from "@/lib/format";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";

interface Props {
  logs: Record<string, DayLog>;
  today: string;
}

type Range = 14 | 30;

export function TrendChart({ logs, today }: Props) {
  const [range, setRange] = useState<Range>(14);
  const keys = lastNDays(range, today);
  const data = keys.map((k) => {
    const l = logs[k];
    const d = fromKey(k);
    return {
      key: k,
      label: formatMD(k),
      wd: WEEKDAYS_JA[d.getDay()],
      hours: l?.hours ?? 0,
      tokensM: l?.tokensM ?? 0,
      isToday: k === today,
    };
  });
  const sumH = data.reduce((a, d) => a + d.hours, 0);
  const sumT = data.reduce((a, d) => a + d.tokensM, 0);
  const reached = data.filter((d) => d.hours >= REACH_HOURS).length;
  const full = data.filter((d) => d.hours >= LIMIT_HOURS).length;
  const tickEvery = range === 14 ? 1 : 3;

  return (
    <div className="card relative overflow-hidden p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-ink">日次・週次 消費推移</h3>
          <p className="mt-0.5 text-xs text-ink-3">
            上段: 日別稼働時間（赤い点線＝5時間上限） ／ 下段: 推定トークン量
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-line bg-ivory p-1" role="tablist" aria-label="表示期間">
            {([14, 30] as Range[]).map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={range === r}
                onClick={() => setRange(r)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                  range === r ? "bg-white text-clay-deep shadow-sm" : "text-ink-3 hover:text-ink"
                }`}
              >
                {r}日
              </button>
            ))}
          </div>
          <span className="hidden sm:block">
            <ClaudeBuddy size={44} mood="cool" prop="chart" />
          </span>
        </div>
      </div>

      {/* summary strip */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={`${range}日合計`} value={`${sumH.toFixed(1)}h`} />
        <Stat label="1日平均" value={`${(sumH / range).toFixed(1)}h`} />
        <Stat label="上限到達" value={`${reached}日`} hint={`${REACH_HOURS}h以上`} />
        <Stat label="完全燃焼" value={`${full}日`} hint="5.0h" accent />
      </div>

      {/* hours */}
      <div className="mt-5">
        <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-ink-3">
          <span>稼働時間（h）</span>
          <span className="inline-flex items-center gap-3">
            <Legend color="#fbb36f" label={`〜${REACH_HOURS}h`} />
            <Legend color="#ea580c" label="上限到達" />
            <Legend color="#b2583c" label="5.0h完走" />
          </span>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 12, right: 18, left: -18, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="#f1e9dd" strokeWidth={1} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#8c8177" }}
                axisLine={false}
                tickLine={false}
                interval="equidistantPreserveStart"
                minTickGap={tickEvery === 1 ? 16 : 24}
              />
              <YAxis
                domain={[0, 5.5]}
                ticks={[0, 1, 2, 3, 4, 5]}
                tick={{ fontSize: 11, fill: "#8c8177" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(234,88,12,0.06)" }} content={<HoursTip />} />
              <ReferenceLine
                y={LIMIT_HOURS}
                stroke="#dc2626"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: "5h 上限", position: "insideTopRight", fontSize: 10, fill: "#dc2626", fontWeight: 700 }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={500}>
                {data.map((d) => (
                  <Cell
                    key={d.key}
                    fill={d.hours >= LIMIT_HOURS ? "#b2583c" : d.hours >= REACH_HOURS ? "#ea580c" : "#fbb36f"}
                    stroke={d.isToday ? "#1f1b16" : "none"}
                    strokeWidth={d.isToday ? 1.5 : 0}
                    strokeDasharray={d.isToday ? "3 2" : undefined}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* tokens */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-ink-3">
          <span>推定トークン量（M）</span>
          <span>期間合計 {fmtTokensM(sumT)}</span>
        </div>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 18, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="tokGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f1e9dd" strokeWidth={1} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#8c8177" }}
                axisLine={false}
                tickLine={false}
                interval="equidistantPreserveStart"
                minTickGap={tickEvery === 1 ? 16 : 24}
              />
              <YAxis tick={{ fontSize: 11, fill: "#8c8177" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip cursor={{ stroke: "#ea580c", strokeWidth: 1 }} content={<TokensTip />} />
              <Area
                type="monotone"
                dataKey="tokensM"
                stroke="#ea580c"
                strokeWidth={2}
                fill="url(#tokGrad)"
                dot={{ r: 3.5, fill: "#ea580c", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 5.5, fill: "#ea580c", stroke: "#fff", strokeWidth: 2 }}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl px-3 py-2.5 ${accent ? "bg-orange-tint" : "bg-ivory"}`}>
      <div className="text-[10px] font-bold text-ink-3">
        {label}
        {hint && <span className="ml-1 font-medium">({hint})</span>}
      </div>
      <div className="num text-lg text-ink">{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

type TipProps = { active?: boolean; payload?: Array<{ payload: { label: string; wd: string; hours: number; tokensM: number; isToday: boolean } }> };

function HoursTip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <div className="font-bold text-ink">
        {p.label}（{p.wd}）{p.isToday && <span className="ml-1 text-clay">今日</span>}
      </div>
      <div className="num mt-0.5 text-base text-ink">
        {p.hours.toFixed(1)}h <span className="text-[11px] text-ink-3">/ 5.0h ・ {Math.round((p.hours / 5) * 100)}%</span>
      </div>
      {p.hours >= LIMIT_HOURS ? (
        <div className="text-[11px] font-bold text-clay-deep">🔥 完全燃焼</div>
      ) : p.hours >= REACH_HOURS ? (
        <div className="text-[11px] font-bold text-orange">上限到達</div>
      ) : null}
    </div>
  );
}

function TokensTip({ active, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <div className="font-bold text-ink">
        {p.label}（{p.wd}）
      </div>
      <div className="num mt-0.5 text-base text-ink">{fmtTokensM(p.tokensM)}</div>
      <div className="text-[11px] text-ink-3">推定トークン</div>
    </div>
  );
}
