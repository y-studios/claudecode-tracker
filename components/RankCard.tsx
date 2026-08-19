"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { RANKS, type Badge, type Rank } from "@/lib/stats";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";
import { Asterisk } from "./claude/Asterisk";

interface Props {
  rank: Rank;
  totalHours: number;
  badges: Badge[];
}

const TIER_STYLE: Record<Badge["tier"], string> = {
  bronze: "from-[#f5d0b5] to-[#d89a72]",
  silver: "from-[#e8e8ec] to-[#b9bcc6]",
  gold: "from-[#fde68a] to-[#f59e0b]",
  crown: "from-[#fbcfe8] to-[#c084fc]",
  special: "from-[#fed7aa] to-[#fb923c]",
};

export function RankCard({ rank, totalHours, badges }: Props) {
  const prog = rank.nextHours ? Math.min(1, (totalHours - rank.minHours) / (rank.nextHours - rank.minHours)) : 1;
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <Asterisk size={140} weight={0.16} className="pointer-events-none absolute -bottom-10 -right-8 text-gold/20" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-ink">使い手ランク ＆ 実績</h3>
          <p className="mt-0.5 text-xs text-ink-3">累計稼働と連続記録でアンロック</p>
        </div>
        <ClaudeBuddy size={48} mood={rank.level >= 5 ? "fire" : "happy"} prop={rank.level >= 4 ? "trophy" : "none"} tone={rank.level >= 6 ? "gold" : "orange"} />
      </div>

      {/* current rank */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-orange-tint to-[#fde7d2] p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-3xl shadow-sm">{rank.emoji}</span>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-clay">現在のランク Lv.{rank.level}</div>
            <div className="truncate text-xl font-black text-ink">{rank.name}</div>
            <div className="display text-[11px] font-bold uppercase tracking-wider text-ink-3">{rank.sub}</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-[11px] font-bold text-ink-3">
            <span>累計 {totalHours.toFixed(1)}h</span>
            <span>
              {rank.nextHours
                ? `次のランクまで あと${Math.max(0, rank.nextHours - totalHours).toFixed(1)}h`
                : "最高ランク到達！"}
            </span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-bright to-clay"
              initial={false}
              animate={{ width: `${prog * 100}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
            />
          </div>
        </div>
      </div>

      {/* ladder */}
      <ol className="mt-3 flex flex-wrap gap-1.5">
        {RANKS.map((r) => (
          <li
            key={r.level}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              r.level === rank.level
                ? "bg-orange text-white"
                : r.level < rank.level
                  ? "bg-orange-tint text-clay-deep"
                  : "bg-ivory text-ink-3"
            }`}
            title={`${r.name}: 累計${r.minHours}h〜`}
          >
            {r.emoji} {r.minHours}h
          </li>
        ))}
      </ol>

      {/* badges */}
      <div className="mt-5 flex items-center justify-between">
        <h4 className="text-sm font-black text-ink">アチーブメントバッジ</h4>
        <span className="text-xs font-bold text-ink-3">
          {unlocked} / {badges.length} 獲得
        </span>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        {badges.map((b, i) => (
          <motion.li
            key={b.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={`relative rounded-2xl border p-3 ${
              b.unlocked ? "border-transparent bg-white shadow-sm" : "border-dashed border-line bg-ivory/60"
            }`}
            title={b.desc}
          >
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br text-2xl ${TIER_STYLE[b.tier]} ${
                b.unlocked ? "" : "grayscale opacity-60"
              }`}
            >
              {b.emoji}
            </div>
            {!b.unlocked && (
              <span className="absolute right-2.5 top-2.5 text-ink-3">
                <Lock size={12} />
              </span>
            )}
            <div className={`mt-2 text-[12px] font-black leading-tight ${b.unlocked ? "text-ink" : "text-ink-2"}`}>
              {b.name}
            </div>
            <div className="mt-0.5 text-[10px] leading-snug text-ink-3">{b.desc}</div>
            {!b.unlocked && (
              <div className="mt-1.5">
                <div className="h-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-orange-bright" style={{ width: `${b.progress * 100}%` }} />
                </div>
                <div className="mt-0.5 text-[9px] text-ink-3">{b.progressLabel}</div>
              </div>
            )}
            {b.unlocked && <div className="mt-1.5 text-[10px] font-bold text-good">✓ 獲得済み</div>}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
