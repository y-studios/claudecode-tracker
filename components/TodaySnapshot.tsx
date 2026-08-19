"use client";

import { motion } from "framer-motion";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";
import { Asterisk } from "./claude/Asterisk";
import { LIMIT_HOURS } from "@/lib/types";
import { fmtTokensM, hoursToHM } from "@/lib/format";
import { formatLong } from "@/lib/date";

interface Props {
  today: string;
  hours: number;
  tokensM: number;
  syncedAgo: string;
}

export function TodaySnapshot({ today, hours, tokensM, syncedAgo }: Props) {
  const pct = Math.min(1, hours / LIMIT_HOURS);
  const remain = Math.max(0, LIMIT_HOURS - hours);

  const status =
    hours >= LIMIT_HOURS
      ? { text: "🎉 本日の5時間枠を完全燃焼！", tone: "text-good bg-good-soft", mood: "party" as const }
      : pct >= 0.9
        ? { text: `⚠️ あと${hoursToHM(remain)}で上限。使い切ったらリセット待ち`, tone: "text-danger bg-danger-soft", mood: "fire" as const }
        : pct >= 0.5
          ? { text: `🔥 折り返し。上限まであと${hoursToHM(remain)}`, tone: "text-clay-deep bg-orange-tint", mood: "happy" as const }
          : pct > 0
            ? { text: `☕ ウォームアップ中。あと${hoursToHM(remain)}使える`, tone: "text-ink-2 bg-ivory-2", mood: "happy" as const }
            : { text: "✳️ 今日はまだ稼働ログなし", tone: "text-ink-2 bg-ivory-2", mood: "sleepy" as const };

  return (
    <div className="card relative overflow-hidden">
      <Asterisk size={180} weight={0.16} className="pointer-events-none absolute -right-10 -top-12 text-orange/[0.07]" />
      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        {/* ===== ゲージ ===== */}
        <div className="flex flex-col items-center">
          <div className="flex w-full items-center justify-between">
            <div>
              <div className="text-xs font-bold text-ink-3">{formatLong(today)}</div>
              <h3 className="mt-0.5 text-lg font-black text-ink">本日の5時間リミット</h3>
            </div>
            <ClaudeBuddy size={56} mood={status.mood} prop={hours >= LIMIT_HOURS ? "trophy" : "none"} />
          </div>

          <Gauge pct={pct} hours={hours} />

          <div className={`mt-2 rounded-full px-4 py-2 text-center text-sm font-bold ${status.tone}`}>{status.text}</div>

          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            <Mini label="残り" value={remain <= 0 ? "0分" : hoursToHM(remain)} />
            <Mini label="消費率" value={`${Math.round(pct * 100)}%`} />
            <Mini label="推定トークン" value={fmtTokensM(tokensM)} />
          </div>
        </div>

        {/* ===== 実測サマリー(読み取り専用) ===== */}
        <div className="relative flex flex-col justify-center">
          <div className="speech text-sm font-bold text-ink">
            {hours >= LIMIT_HOURS ? "5時間完走お疲れ様！実測ログをそのまま反映してるよ💾" : "このカードは自動集計のみ。手入力はできません"}
          </div>

          <div className="mt-6 rounded-2xl bg-ivory p-5">
            <div className="text-sm font-bold text-ink">今日の実測稼働</div>
            <div className="num mt-1 text-4xl text-ink">
              {hours.toFixed(1)}
              <span className="text-base text-ink-3"> / {LIMIT_HOURS.toFixed(1)}h</span>
            </div>
            <div className="mt-3 text-sm font-bold text-ink">今日の推定トークン</div>
            <div className="num mt-1 text-3xl text-ink">{fmtTokensM(tokensM)}</div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-ink-3">
            Claude Codeのローカルログ（<code className="rounded bg-ivory px-1 py-0.5">~/.claude/projects</code>）から
            1時間ごとに自動集計。手動での記録・編集は行っていません。
          </p>
          <p className="mt-2 text-[11px] text-ink-3">最終同期: {syncedAgo}</p>
        </div>
      </div>
    </div>
  );
}

function Gauge({ pct, hours }: { pct: number; hours: number }) {
  const R = 84;
  const C = 2 * Math.PI * R;
  const arc = 0.75; // 270度
  const dash = C * arc;
  const fill = dash * pct;
  const color = pct >= 1 ? "#3f8f5f" : pct >= 0.9 ? "#dc2626" : pct >= 0.5 ? "#ea580c" : "#f59e0b";
  return (
    <div className="relative mt-3 h-[210px] w-[210px]">
      <svg viewBox="0 0 200 200" className="h-full w-full rotate-[135deg]">
        <circle cx="100" cy="100" r={R} fill="none" stroke="#f1e9dd" strokeWidth="18" strokeDasharray={`${dash} ${C}`} strokeLinecap="round" />
        <motion.circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${C}`}
          initial={false}
          animate={{ strokeDasharray: `${Math.max(0.001, fill)} ${C}`, stroke: color }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <circle cx="100" cy="100" r={R} fill="none" stroke="#fff" strokeWidth="20" strokeDasharray={`2 ${C}`} strokeDashoffset={-(dash * 0.9 - 1)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="num text-[44px] leading-none text-ink">
          {hours.toFixed(1)}
          <span className="text-base text-ink-3">h</span>
        </div>
        <div className="mt-1 text-xs font-bold text-ink-3">/ {LIMIT_HOURS.toFixed(1)}h</div>
        <div className="num mt-1 text-sm" style={{ color }}>
          {Math.round(pct * 100)}%{pct >= 0.9 && pct < 1 ? " パンパン！" : ""}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ivory px-2 py-2.5">
      <div className="text-[10px] font-bold text-ink-3">{label}</div>
      <div className="num text-[15px] text-ink">{value}</div>
    </div>
  );
}
