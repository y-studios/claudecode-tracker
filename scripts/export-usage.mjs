#!/usr/bin/env node
// Claude Code のローカルセッションログ(~/.claude/projects/**/*.jsonl)から
// 実際の稼働時間・消費トークンを集計し、data/usage.json に書き出す。
// このファイルはリポジトリにコミットされ、Next.js のビルド時に静的に読み込まれる
// (サイト側はサーバーもLocalStorageも持たない、完全な読み取り専用ダッシュボード)。
//
// 使い方:
//   node scripts/export-usage.mjs                     → data/usage.json に書き出し
//   node scripts/export-usage.mjs --out=foo.json       → 出力先を指定
//   node scripts/export-usage.mjs --days=30            → 直近N日分だけ（既定90日）
//
// 実行するのはこのMac自身のログ読み取りのみで、外部送信は一切ない。
// 書き出すのは日付・稼働時間・トークン数のみ（会話内容やプロジェクト名は含めない）。
//
// 「稼働時間」の考え方: 全セッション横断でメッセージのタイムスタンプを時系列に並べ、
// 間隔が15分以内のものを1つの活動区間として連結する（WakaTime等と同じアイドル閾値の考え方）。
// 並行して走らせた複数セッション（バックグラウンドエージェント等）の時間も、
// 全ファイルのイベントを1本の時系列に合流させてから区間統合するので二重計上しない。
// 「トークン」は各アシスタント発言の usage（input+output+cache_creation+cache_read）の実測合計。

import { readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);
const OUT = args.out || "data/usage.json";
const DAYS = Number(args.days || 90);
const TZ = args.tz || "Asia/Tokyo";
const GAP_MS = 15 * 60 * 1000; // アイドル閾値: 15分
const NUB_MS = 60 * 1000; // 孤立した1メッセージに与える最小稼働時間

const ROOT = join(homedir(), ".claude", "projects");

function listJsonlFiles(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...listJsonlFiles(p));
    else if (e.isFile() && e.name.endsWith(".jsonl")) out.push(p);
  }
  return out;
}

function localDateKey(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const m = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${m.year}-${m.month}-${m.day}`;
}

/** その日のローカル0:00〜24:00をUTCミリ秒の範囲で返す */
function dayBoundsUTC(dateKey, timeZone) {
  const noonUTC = new Date(`${dateKey}T12:00:00Z`);
  const local = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(noonUTC);
  const m = Object.fromEntries(local.map((p) => [p.type, p.value]));
  const localNoon = new Date(
    Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour, +m.minute, +m.second),
  );
  const offsetMs = localNoon - noonUTC;
  const startLocalMidnightUTC = new Date(`${dateKey}T00:00:00Z`).getTime() - offsetMs;
  return [startLocalMidnightUTC, startLocalMidnightUTC + 24 * 3600 * 1000];
}

async function readLines(file) {
  const rl = createInterface({ input: createReadStream(file, "utf8"), crlfDelay: Infinity });
  const lines = [];
  for await (const line of rl) if (line.trim()) lines.push(line);
  return lines;
}

async function main() {
  const files = listJsonlFiles(ROOT);
  if (files.length === 0) {
    console.error(`セッションログが見つかりませんでした: ${ROOT}`);
    process.exit(1);
  }

  const cutoff = Date.now() - DAYS * 86400000;
  const activityTs = []; // 全種別のイベント時刻（稼働時間の算出用）
  const usageEvents = []; // [{ts, tokens}]（トークン集計用）

  for (const file of files) {
    let st;
    try {
      st = statSync(file);
    } catch {
      continue;
    }
    if (st.mtimeMs < cutoff - 86400000) continue; // 更新が古すぎるファイルはスキップ(高速化)

    const lines = await readLines(file);
    for (const line of lines) {
      let d;
      try {
        d = JSON.parse(line);
      } catch {
        continue;
      }
      const ts = d.timestamp ? Date.parse(d.timestamp) : NaN;
      if (!Number.isFinite(ts) || ts < cutoff) continue;

      if (d.type === "user" || d.type === "assistant") activityTs.push(ts);
      if (d.type === "assistant" && d.message?.usage) {
        const u = d.message.usage;
        const tokens =
          (u.input_tokens || 0) +
          (u.output_tokens || 0) +
          (u.cache_creation_input_tokens || 0) +
          (u.cache_read_input_tokens || 0);
        usageEvents.push({ ts, tokens });
      }
    }
  }

  if (activityTs.length === 0) {
    console.error("直近の稼働ログが見つかりませんでした（--days を増やして再実行してください）");
    process.exit(1);
  }

  activityTs.sort((a, b) => a - b);

  // 時系列イベントを15分ギャップでクラスタリングし、活動区間 [start, end] を作る。
  // 全ファイル横断でソート済みのため、並行セッションの重複区間も自然に1本へ統合される。
  const intervals = [];
  let curStart = activityTs[0];
  let curEnd = activityTs[0];
  for (let i = 1; i < activityTs.length; i++) {
    const t = activityTs[i];
    if (t - curEnd <= GAP_MS) {
      curEnd = t;
    } else {
      intervals.push([curStart, Math.max(curEnd, curStart + NUB_MS)]);
      curStart = t;
      curEnd = t;
    }
  }
  intervals.push([curStart, Math.max(curEnd, curStart + NUB_MS)]);

  // 稼働時間: 各区間をローカル日付境界で切り、日毎に加算
  const hoursByDate = new Map();
  for (const [s, e] of intervals) {
    let cursor = s;
    while (cursor < e) {
      const key = localDateKey(new Date(cursor), TZ);
      const [, dayEndUTC] = dayBoundsUTC(key, TZ);
      const segEnd = Math.min(e, dayEndUTC);
      const hours = (segEnd - cursor) / 3600000;
      hoursByDate.set(key, (hoursByDate.get(key) || 0) + hours);
      cursor = segEnd;
    }
  }

  // トークン: 発生日ごとに集計
  const tokensByDate = new Map();
  for (const ev of usageEvents) {
    const key = localDateKey(new Date(ev.ts), TZ);
    tokensByDate.set(key, (tokensByDate.get(key) || 0) + ev.tokens);
  }

  const dates = new Set([...hoursByDate.keys(), ...tokensByDate.keys()]);
  const logs = {};
  for (const date of dates) {
    const hours = Math.round((hoursByDate.get(date) || 0) * 10) / 10;
    const tokensM = Math.round(((tokensByDate.get(date) || 0) / 1e6) * 100) / 100;
    logs[date] = { date, hours, tokensM };
  }

  const out = { generatedAt: new Date().toISOString(), logs };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

  const sortedDates = [...dates].sort();
  const totalHours = [...hoursByDate.values()].reduce((a, b) => a + b, 0);
  const totalTokensM = [...tokensByDate.values()].reduce((a, b) => a + b, 0) / 1e6;
  console.log(`✳ 実データを書き出しました: ${OUT}`);
  console.log(`  対象期間: ${sortedDates[0]} 〜 ${sortedDates[sortedDates.length - 1]}（${sortedDates.length}日分）`);
  console.log(`  合計稼働: ${totalHours.toFixed(1)}h ／ 合計トークン: ${totalTokensM.toFixed(1)}M`);
}

main();
