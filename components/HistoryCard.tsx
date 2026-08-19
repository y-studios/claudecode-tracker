"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2, X, Download, Upload, Eraser, RotateCcw, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { formatLong, formatMD, fromKey, WEEKDAYS_JA, todayKey, lastNDays } from "@/lib/date";
import { LIMIT_HOURS, MAX_TOKENS_M, TASK_TAGS, type DayLog, type TagId } from "@/lib/types";
import { tracker } from "@/lib/storage";
import { fmtTokensM } from "@/lib/format";
import { REACH_HOURS } from "@/lib/stats";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";

interface Props {
  logs: Record<string, DayLog>;
  today: string;
}

const TAG_MAP = Object.fromEntries(TASK_TAGS.map((t) => [t.id, t])) as Record<TagId, (typeof TASK_TAGS)[number]>;

export function HistoryCard({ logs, today }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const keys = Object.keys(logs).sort().reverse();
  const visible = showAll ? keys : keys.slice(0, 12);
  const hasSamples = Object.values(logs).some((l) => l.sample);

  const flash = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2400);
  };

  const exportJSON = () => {
    const blob = new Blob([tracker.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `claudecode-tracker-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJSON = async (f: File) => {
    try {
      const n = tracker.importJSON(await f.text());
      flash(`${n}件のログを取り込みました`);
    } catch {
      flash("読み込めませんでした（JSON形式を確認してください）");
    }
  };

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-ink">過去ログの編集</h3>
          <p className="mt-0.5 text-xs text-ink-3">
            {keys.length}日分を保存中。クリックで編集・削除
            {hasSamples && <span className="ml-1 rounded-full bg-orange-tint px-2 py-0.5 text-[10px] font-bold text-clay-deep">サンプルログ含む</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" className="chip !py-1.5 text-xs" onClick={() => setEditing("__new__")}>
            <Plus size={13} /> 過去日を追加
          </button>
          <button type="button" className="chip !py-1.5 text-xs" onClick={exportJSON}>
            <Download size={13} /> エクスポート
          </button>
          <button type="button" className="chip !py-1.5 text-xs" onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> インポート
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importJSON(f);
              e.target.value = "";
            }}
          />
          {hasSamples ? (
            <button
              type="button"
              className="chip !py-1.5 text-xs"
              onClick={() => {
                if (confirm("初期プリセットのサンプルログをすべて削除します。よろしいですか？")) {
                  tracker.clearSamples();
                  flash("サンプルログを削除しました");
                }
              }}
            >
              <Eraser size={13} /> サンプルを消す
            </button>
          ) : (
            <button
              type="button"
              className="chip !py-1.5 text-xs"
              onClick={() => {
                tracker.restoreSamples();
                flash("サンプルログを復元しました（自分の記録は上書きされません）");
              }}
            >
              <RotateCcw size={13} /> サンプル復元
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-xl bg-good-soft px-3 py-2 text-xs font-bold text-good"
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {keys.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
          <ClaudeBuddy size={90} mood="sleepy" prop="coffee" />
          <p className="text-sm font-bold text-ink-2">まだログがありません。上のフォームから今日の分を記録しよう</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line/70">
          {visible.map((k) => {
            const l = logs[k];
            const d = fromKey(k);
            const pct = Math.min(1, l.hours / LIMIT_HOURS);
            return (
              <li key={k}>
                <button
                  type="button"
                  onClick={() => setEditing(k)}
                  className="group flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-orange-tint/50 sm:rounded-xl sm:px-2"
                >
                  <div className="w-[72px] shrink-0 leading-tight">
                    <div className="text-sm font-black text-ink">
                      {formatMD(k)}
                      <span className="ml-0.5 text-[10px] font-bold text-ink-3">({WEEKDAYS_JA[d.getDay()]})</span>
                    </div>
                    {k === today && <div className="text-[10px] font-bold text-clay">今日</div>}
                    {l.sample && <div className="text-[9px] text-ink-3">サンプル</div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory-2">
                        <div
                          className={`h-full rounded-full ${l.hours >= LIMIT_HOURS ? "bg-clay-deep" : l.hours >= REACH_HOURS ? "bg-orange" : "bg-[#fbb36f]"}`}
                          style={{ width: `${pct * 100}%` }}
                        />
                      </div>
                      <span className="num w-12 text-right text-sm text-ink">{l.hours.toFixed(1)}h</span>
                      <span className="num hidden w-14 text-right text-xs text-ink-3 sm:block">{fmtTokensM(l.tokensM)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-ink-3">
                      {l.tags.map((t) => (
                        <span key={t} className="rounded-full bg-ivory px-1.5 py-0.5 font-bold">
                          {TAG_MAP[t]?.emoji} {TAG_MAP[t]?.label}
                        </span>
                      ))}
                      {l.memo && <span className="truncate">{l.memo}</span>}
                    </div>
                  </div>
                  <Pencil size={14} className="shrink-0 text-ink-3 opacity-0 transition group-hover:opacity-100" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {keys.length > 12 && (
        <button type="button" className="btn-ghost mt-3 w-full !py-2 text-sm" onClick={() => setShowAll((v) => !v)}>
          {showAll ? "閉じる" : `もっと見る（残り${keys.length - 12}件）`}
        </button>
      )}

      <AnimatePresence>
        {editing && (
          <EditModal
            key={editing}
            date={editing === "__new__" ? null : editing}
            log={editing === "__new__" ? undefined : logs[editing]}
            existing={logs}
            today={today}
            onClose={() => setEditing(null)}
            onSaved={(d) => {
              setEditing(null);
              flash(`${formatMD(d)} のログを保存しました`);
            }}
            onDeleted={(d) => {
              setEditing(null);
              flash(`${formatMD(d)} のログを削除しました`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditModal({
  date,
  log,
  existing,
  today,
  onClose,
  onSaved,
  onDeleted,
}: {
  date: string | null;
  log?: DayLog;
  existing: Record<string, DayLog>;
  today: string;
  onClose: () => void;
  onSaved: (date: string) => void;
  onDeleted: (date: string) => void;
}) {
  const [d, setD] = useState<string>(date ?? firstFreeDay(existing, today));
  const [hours, setHours] = useState(log?.hours ?? 4.5);
  const [tokensM, setTokensM] = useState(log?.tokensM ?? 3.5);
  const [tags, setTags] = useState<TagId[]>(log?.tags ?? []);
  const [memo, setMemo] = useState(log?.memo ?? "");
  const isNew = !date;

  const save = () => {
    if (!d) return;
    tracker.upsert({ date: d, hours, tokensM, tags, memo: memo || undefined });
    onSaved(d);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? "過去日のログを追加" : "ログを編集"}
    >
      <motion.div
        initial={{ y: 30, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="card w-full max-w-md p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <ClaudeBuddy size={46} mood="happy" />
            <div>
              <div className="text-[11px] font-bold text-clay">{isNew ? "過去日のログを追加" : "ログを編集"}</div>
              {isNew ? (
                <input
                  type="date"
                  value={d}
                  max={today}
                  onChange={(e) => setD(e.target.value)}
                  className="mt-0.5 rounded-lg border border-line bg-ivory px-2 py-1 text-sm font-bold text-ink outline-none focus:border-orange"
                />
              ) : (
                <div className="text-base font-black text-ink">{formatLong(d)}</div>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="閉じる" className="rounded-full p-1.5 text-ink-3 hover:bg-ivory">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between">
            <label className="text-sm font-bold text-ink">稼働時間</label>
            <span className="num text-xl text-ink">
              {hours.toFixed(1)}
              <span className="text-xs text-ink-3"> / {LIMIT_HOURS.toFixed(1)}h</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={LIMIT_HOURS}
            step={0.1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            style={{ ["--pct" as string]: `${(hours / LIMIT_HOURS) * 100}%` }}
            className="mt-2"
          />
        </div>
        <div className="mt-4">
          <div className="flex items-end justify-between">
            <label className="text-sm font-bold text-ink">推定トークン</label>
            <span className="num text-xl text-ink">
              {tokensM.toFixed(1)}
              <span className="text-xs text-ink-3"> M</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={MAX_TOKENS_M}
            step={0.1}
            value={tokensM}
            onChange={(e) => setTokensM(Number(e.target.value))}
            style={{ ["--pct" as string]: `${(tokensM / MAX_TOKENS_M) * 100}%` }}
            className="mt-2"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {TASK_TAGS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="chip !px-2.5 !py-1 text-xs"
              data-on={tags.includes(t.id)}
              onClick={() => setTags((cur) => (cur.includes(t.id) ? cur.filter((x) => x !== t.id) : [...cur, t.id]))}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value.slice(0, 60))}
          placeholder="ひとことメモ（任意）"
          className="mt-3 w-full rounded-xl border border-line bg-ivory px-3 py-2 text-sm text-ink outline-none focus:border-orange focus:bg-white"
        />

        <div className="mt-5 flex items-center justify-between gap-2">
          {!isNew ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`${formatMD(d)} のログを削除します。よろしいですか？`)) {
                  tracker.remove(d);
                  onDeleted(d);
                }
              }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-danger hover:bg-danger-soft"
            >
              <Trash2 size={14} /> 削除
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-ghost !py-2 text-sm">
              キャンセル
            </button>
            <button type="button" onClick={save} className="btn-primary !py-2 text-sm" disabled={!d}>
              保存する
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function firstFreeDay(existing: Record<string, DayLog>, today: string): string {
  for (const k of lastNDays(60, today).reverse()) if (!existing[k]) return k;
  return today;
}
