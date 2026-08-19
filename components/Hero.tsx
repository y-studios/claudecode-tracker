"use client";

import { motion } from "framer-motion";
import { Flame, Clock, Coins, Crown, RefreshCw } from "lucide-react";
import { Asterisk } from "./claude/Asterisk";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";
import type { Rank, Totals } from "@/lib/stats";
import { fmtTokensM } from "@/lib/format";
import { LIMIT_HOURS } from "@/lib/types";

interface Props {
  todayHours: number;
  streak: number;
  totals: Totals;
  rank: Rank;
  syncedAgo: string;
}

export function Hero({ todayHours, streak, totals, rank, syncedAgo }: Props) {
  const pct = Math.min(1, todayHours / LIMIT_HOURS);
  const bubble =
    todayHours >= LIMIT_HOURS
      ? "今日の5時間枠、完全燃焼！最高！🎉"
      : pct >= 0.9
        ? "パンパン！あとひと押しで完走だよ🔥"
        : pct > 0
          ? "今日も5時間上限目指して爆走中！🔥"
          : "今日の実測ログ、まだ届いてないみたい✳️";

  return (
    <section id="top" className="relative overflow-hidden">
      {/* 背景のうすい巨大ワードマーク（geppy風） */}
      <div
        aria-hidden
        className="display pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[10.5vw] font-extrabold leading-none text-clay/[0.06]"
      >
        MASTER OF CLAUDE
      </div>
      <div className="dotted-bg absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(60%_60%_at_60%_30%,#000,transparent)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          {/* left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-bold text-clay-deep shadow-sm"
            >
              <RefreshCw size={12} />
              1時間ごとに自動更新・実測データのみ
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="display mt-5 text-[2.9rem] leading-[1.02] font-extrabold tracking-tight text-ink sm:text-[4.2rem] lg:text-[4.8rem]"
            >
              Max out,
              <br />
              <span className="bg-gradient-to-r from-orange-bright via-orange to-clay bg-clip-text text-transparent">
                Every day.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-2 sm:text-base"
            >
              Claude Codeのローカルログから実際の稼働時間・消費トークンを自動集計。
              <br className="hidden sm:block" />
              手入力は一切なし、眺めるだけの実績ダッシュボード。
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <a href="#dashboard" className="btn-primary">
                実績を見る
              </a>
              <a href="#share" className="btn-ghost">
                𝕏 でシェア
              </a>
            </motion.div>
            <p className="mt-4 text-xs text-ink-3">最終同期: {syncedAgo}</p>
          </div>

          {/* right: character */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, type: "spring", bounce: 0.35 }}
            className="relative mx-auto w-full max-w-[460px]"
          >
            <div className="relative aspect-[1.05] w-full">
              {/* big blob */}
              <div className="absolute inset-[6%] rounded-[42%_58%_55%_45%/48%_42%_58%_52%] bg-gradient-to-br from-orange-soft via-[#fcd9bb] to-[#f6c9a8] shadow-[inset_0_-20px_40px_rgba(204,120,92,0.15)]" />
              <Asterisk size={54} weight={0.22} className="absolute left-[8%] top-[10%] text-clay/50 animate-spin-slow" />
              <Asterisk size={26} weight={0.22} className="absolute right-[12%] top-[18%] text-orange animate-pulse-soft" />
              <Asterisk size={34} weight={0.22} className="absolute bottom-[14%] left-[18%] text-gold" />
              <Asterisk size={18} weight={0.22} className="absolute bottom-[28%] right-[6%] text-clay/60" />

              {/* buddy */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[44%]">
                <ClaudeBuddy size={230} mood={pct >= 1 ? "party" : pct >= 0.9 ? "fire" : "happy"} prop="terminal" float />
              </div>

              {/* speech bubble */}
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.7, type: "spring", bounce: 0.5 }}
                className="speech speech-top absolute left-1/2 top-[2%] w-[min(86%,300px)] -translate-x-1/2 text-center text-sm font-bold text-ink"
              >
                {bubble}
              </motion.div>

              {/* floating mini cards */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="card absolute bottom-[12%] left-0 flex items-center gap-3 px-4 py-3 animate-float-slow"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-tint text-orange">
                  <Clock size={18} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold text-ink-3">今日の稼働</span>
                  <span className="num text-lg text-ink">
                    {todayHours.toFixed(1)}
                    <span className="text-xs text-ink-3"> / {LIMIT_HOURS.toFixed(1)}h</span>
                  </span>
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.05 }}
                className="card absolute bottom-[4%] right-0 flex items-center gap-3 px-4 py-3 animate-float"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-danger-soft text-danger">
                  <Flame size={18} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold text-ink-3">連続上限到達</span>
                  <span className="num text-lg text-ink">
                    {streak}
                    <span className="text-xs text-ink-3"> 日</span>
                  </span>
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* クイックステータスバー */}
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickStat
            icon={<Flame size={20} />}
            tone="bg-danger-soft text-danger"
            label="連続上限到達"
            value={`${streak}日`}
            note={`${(LIMIT_HOURS * 0.9).toFixed(1)}h以上で到達`}
            delay={0}
          />
          <QuickStat
            icon={<Clock size={20} />}
            tone="bg-orange-tint text-orange"
            label="今月の総稼働"
            value={`${totals.monthHours.toFixed(1)}時間`}
            note={`${totals.monthDays}日分の実測`}
            delay={0.05}
          />
          <QuickStat
            icon={<Coins size={20} />}
            tone="bg-[#fff5d6] text-[#b7791f]"
            label="推定総トークン"
            value={fmtTokensM(totals.totalTokensM)}
            note="実測ログの合計"
            delay={0.1}
          />
          <QuickStat
            icon={<Crown size={20} />}
            tone="bg-[#f3e8ff] text-[#7e22ce]"
            label="使い手ランク"
            value={`${rank.emoji} ${rank.name}`}
            note={rank.sub}
            delay={0.15}
            small
            wide
          />
        </div>
      </div>
    </section>
  );
}

function QuickStat({
  icon,
  tone,
  label,
  value,
  note,
  delay,
  small,
  wide,
}: {
  icon: React.ReactNode;
  tone: string;
  label: string;
  value: string;
  note: string;
  delay: number;
  small?: boolean;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay, duration: 0.45 }}
      className={`card flex items-center gap-3 px-4 py-4 ${wide ? "col-span-2 lg:col-span-1" : ""}`}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tone}`}>{icon}</span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold text-ink-3">{label}</span>
        <span className={`num block truncate text-ink ${small ? "text-[15px]" : "text-xl"}`}>{value}</span>
        <span className="block truncate text-[10px] text-ink-3">{note}</span>
      </span>
    </motion.div>
  );
}
