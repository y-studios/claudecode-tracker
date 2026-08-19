import { addDays, lastNDays, monthKey, todayKey } from "./date";
import { LIMIT_HOURS, REACH_RATIO, type DayLog } from "./types";

export const REACH_HOURS = Math.round(LIMIT_HOURS * REACH_RATIO * 10) / 10; // 4.5h

export function isReached(log?: DayLog): boolean {
  return !!log && log.hours >= REACH_HOURS;
}
export function isFull(log?: DayLog): boolean {
  return !!log && log.hours >= LIMIT_HOURS;
}

/** 今日 or 昨日から遡る連続「上限到達」日数 */
export function currentStreak(logs: Record<string, DayLog>, today = todayKey()): number {
  let start = today;
  if (!isReached(logs[today])) start = addDays(today, -1);
  let n = 0;
  let k = start;
  while (isReached(logs[k])) {
    n++;
    k = addDays(k, -1);
    if (n > 3650) break;
  }
  return n;
}

/** 今日 or 昨日から遡る連続「5.0h完全燃焼」日数 */
export function currentFullStreak(logs: Record<string, DayLog>, today = todayKey()): number {
  let start = today;
  if (!isFull(logs[today])) start = addDays(today, -1);
  let n = 0;
  let k = start;
  while (isFull(logs[k])) {
    n++;
    k = addDays(k, -1);
    if (n > 3650) break;
  }
  return n;
}

export function bestStreak(logs: Record<string, DayLog>, pred = isReached): number {
  const keys = Object.keys(logs).sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of keys) {
    if (pred(logs[k])) {
      run = prev && addDays(prev, 1) === k && run > 0 ? run + 1 : 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
    prev = k;
  }
  return best;
}

export interface Totals {
  totalHours: number;
  totalTokensM: number;
  monthHours: number;
  monthTokensM: number;
  monthDays: number;
  loggedDays: number;
  reachedDays: number;
  fullDays: number;
  avgHours14: number;
  weekHours: number;
  weekTokensM: number;
}

export function computeTotals(logs: Record<string, DayLog>, today = todayKey()): Totals {
  const m = monthKey(today);
  let totalHours = 0;
  let totalTokensM = 0;
  let monthHours = 0;
  let monthTokensM = 0;
  let monthDays = 0;
  let reachedDays = 0;
  let fullDays = 0;
  const all = Object.values(logs);
  for (const l of all) {
    totalHours += l.hours;
    totalTokensM += l.tokensM;
    if (monthKey(l.date) === m) {
      monthHours += l.hours;
      monthTokensM += l.tokensM;
      monthDays++;
    }
    if (isReached(l)) reachedDays++;
    if (isFull(l)) fullDays++;
  }
  const last14 = lastNDays(14, today).map((k) => logs[k]?.hours ?? 0);
  const last7 = lastNDays(7, today);
  const weekHours = last7.reduce((a, k) => a + (logs[k]?.hours ?? 0), 0);
  const weekTokensM = last7.reduce((a, k) => a + (logs[k]?.tokensM ?? 0), 0);
  return {
    totalHours: r1(totalHours),
    totalTokensM: r1(totalTokensM),
    monthHours: r1(monthHours),
    monthTokensM: r1(monthTokensM),
    monthDays,
    loggedDays: all.length,
    reachedDays,
    fullDays,
    avgHours14: r1(last14.reduce((a, b) => a + b, 0) / 14),
    weekHours: r1(weekHours),
    weekTokensM: r1(weekTokensM),
  };
}

function r1(n: number) {
  return Math.round(n * 10) / 10;
}

/* ===== 使い手ランク（見習い〜神） ===== */
export interface Rank {
  level: number;
  name: string;
  sub: string;
  emoji: string;
  minHours: number;
  /** 次ランクまでに必要な累計時間（最終ランクは null） */
  nextHours: number | null;
}

export const RANKS: Omit<Rank, "nextHours">[] = [
  { level: 1, name: "見習い使い手", sub: "Apprentice", emoji: "🌱", minHours: 0 },
  { level: 2, name: "修行中の使い手", sub: "Trainee", emoji: "🔧", minHours: 10 },
  { level: 3, name: "熟練プロンプター", sub: "Skilled Prompter", emoji: "⚡", minHours: 30 },
  { level: 4, name: "Claudeの右腕", sub: "Right Hand of Claude", emoji: "🤝", minHours: 60 },
  { level: 5, name: "特級術師（Claude廃人）", sub: "Grand Sorcerer", emoji: "🔥", minHours: 100 },
  { level: 6, name: "神（使い手の頂）", sub: "God of Claude Code", emoji: "👑", minHours: 200 },
];

export function computeRank(totalHours: number): Rank {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (totalHours >= RANKS[i].minHours) idx = i;
  const r = RANKS[idx];
  const next = RANKS[idx + 1]?.minHours ?? null;
  return { ...r, nextHours: next };
}

/* ===== アチーブメントバッジ ===== */
export interface Badge {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  tier: "bronze" | "silver" | "gold" | "crown" | "special";
  unlocked: boolean;
  progress: number; // 0..1
  progressLabel: string;
}

export function computeBadges(logs: Record<string, DayLog>, today = todayKey()): Badge[] {
  const t = computeTotals(logs, today);
  const streak = Math.max(currentStreak(logs, today), bestStreak(logs));
  const fullStreak = Math.max(currentFullStreak(logs, today), bestStreak(logs, isFull));
  const mk = (
    id: string,
    name: string,
    desc: string,
    emoji: string,
    tier: Badge["tier"],
    cur: number,
    goal: number,
    unit: string,
  ): Badge => ({
    id,
    name,
    desc,
    emoji,
    tier,
    unlocked: cur >= goal,
    progress: Math.max(0, Math.min(1, cur / goal)),
    progressLabel: `${fmtNum(Math.min(cur, goal))} / ${fmtNum(goal)}${unit}`,
  });
  return [
    mk("apprentice", "見習い使い手", "累計10時間達成", "🥉", "bronze", t.totalHours, 10, "h"),
    mk("prompter", "熟練プロンプター", "3日連続で上限到達", "🥈", "silver", streak, 3, "日"),
    mk("righthand", "Claudeの右腕", "累計100時間突破", "🥇", "gold", t.totalHours, 100, "h"),
    mk("haijin", "特級AI廃人", "7日連続で5時間パンパン", "👑", "crown", fullStreak, 7, "日"),
    mk("firstfull", "初完走", "はじめて5.0hを使い切る", "🏁", "special", t.fullDays, 1, "日"),
    mk("tokens10m", "トークン富豪", "累計1,000万トークン消費", "🪙", "special", t.totalTokensM, 10, "M"),
    mk("streak14", "草の番人", "14日連続で上限到達", "🌿", "special", streak, 14, "日"),
    mk("days30", "記録の鬼", "30日分のログを記録", "📅", "special", t.loggedDays, 30, "日"),
  ];
}

function fmtNum(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** ヒートマップの濃さ（0=記録なし, 1〜5） */
export function heatLevel(log?: DayLog): number {
  if (!log) return 0;
  const h = log.hours;
  if (h <= 0) return 0;
  if (h < 1.5) return 1;
  if (h < 3) return 2;
  if (h < 4.5) return 3;
  if (h < 5) return 4;
  return 5;
}
