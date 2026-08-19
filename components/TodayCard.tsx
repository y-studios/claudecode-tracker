"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Save, Check, Minus, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";
import { Asterisk } from "./claude/Asterisk";
import { LIMIT_HOURS, MAX_TOKENS_M, TASK_TAGS, type TagId } from "@/lib/types";
import { fmtTokensM, hoursToHM } from "@/lib/format";
import { formatLong } from "@/lib/date";

export interface Draft {
  hours: number;
  tokensM: number;
  tags: TagId[];
  memo: string;
}

interface Props {
  today: string;
  draft: Draft;
  dirty: boolean;
  savedAt?: number;
  onChange: (d: Draft) => void;
  onSave: () => void;
}

const TOKEN_PRESETS = [1.5, 2.5, 3.5, 4.5, 6.0];

export function TodayCard({ today, draft, dirty, savedAt, onChange, onSave }: Props) {
  const [justSaved, setJustSaved] = useState(false);
  const pct = Math.min(1, draft.hours / LIMIT_HOURS);
  const remain = Math.max(0, LIMIT_HOURS - draft.hours);

  const status =
    pct >= 1
      ? { text: "🎉 本日の5時間枠を完全燃焼！", tone: "text-good bg-good-soft", mood: "party" as const }
      : pct >= 0.9
        ? { text: `⚠️ あと${hoursToHM(remain)}で上限。使い切ったらリセット待ち`, tone: "text-danger bg-danger-soft", mood: "fire" as const }
        : pct >= 0.5
          ? { text: `🔥 折り返し。上限まであと${hoursToHM(remain)}`, tone: "text-clay-deep bg-orange-tint", mood: "happy" as const }
          : pct > 0
            ? { text: `☕ ウォームアップ中。あと${hoursToHM(remain)}使える`, tone: "text-ink-2 bg-ivory-2", mood: "happy" as const }
            : { text: "✳️ 今日はまだ未稼働。上限まで使い倒そう", tone: "text-ink-2 bg-ivory-2", mood: "sleepy" as const };

  const set = (patch: Partial<Draft>) => onChange({ ...draft, ...patch });
  const toggleTag = (id: TagId) =>
    set({ tags: draft.tags.includes(id) ? draft.tags.filter((t) => t !== id) : [...draft.tags, id] });

  const handleSave = () => {
    onSave();
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2200);
  };

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
            <ClaudeBuddy size={56} mood={status.mood} prop={pct >= 1 ? "trophy" : "none"} />
          </div>

          <Gauge pct={pct} hours={draft.hours} />

          <AnimatePresence mode="wait">
            <motion.div
              key={status.text}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={`mt-2 rounded-full px-4 py-2 text-center text-sm font-bold ${status.tone}`}
            >
              {status.text}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            <Mini label="残り" value={remain <= 0 ? "0分" : hoursToHM(remain)} />
            <Mini label="消費率" value={`${Math.round(pct * 100)}%`} />
            <Mini label="推定トークン" value={fmtTokensM(draft.tokensM)} />
          </div>
        </div>

        {/* ===== フォーム ===== */}
        <div className="relative">
          <div className="flex items-start gap-3">
            <div className="speech text-sm font-bold text-ink">
              {pct >= 1 ? "5時間完走お疲れ様！記録しておこう💾" : "スライダーで今日の実績をワンタップ更新！"}
            </div>
          </div>

          {/* 稼働時間 */}
          <div className="mt-5">
            <div className="flex items-end justify-between">
              <label htmlFor="hours" className="text-sm font-bold text-ink">
                今日の稼働時間
              </label>
              <div className="num text-2xl text-ink">
                {draft.hours.toFixed(1)}
                <span className="text-sm text-ink-3"> / {LIMIT_HOURS.toFixed(1)}h</span>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Stepper onClick={() => set({ hours: r1(Math.max(0, draft.hours - 0.1)) })} icon={<Minus size={16} />} label="0.1時間減らす" />
              <input
                id="hours"
                type="range"
                min={0}
                max={LIMIT_HOURS}
                step={0.1}
                value={draft.hours}
                onChange={(e) => set({ hours: Number(e.target.value) })}
                style={{ ["--pct" as string]: `${pct * 100}%` }}
                aria-valuetext={`${draft.hours.toFixed(1)}時間`}
              />
              <Stepper onClick={() => set({ hours: r1(Math.min(LIMIT_HOURS, draft.hours + 0.1)) })} icon={<Plus size={16} />} label="0.1時間増やす" />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 4.5, 5].map((h) => (
                <button
                  key={h}
                  type="button"
                  className="chip !px-3 !py-1.5 text-xs"
                  data-on={draft.hours === h}
                  onClick={() => set({ hours: h })}
                >
                  {h.toFixed(1)}h{h === 5 ? " 🔥" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* トークン */}
          <div className="mt-6">
            <div className="flex items-end justify-between">
              <label htmlFor="tokens" className="text-sm font-bold text-ink">
                推定消費トークン数
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={MAX_TOKENS_M}
                  step={0.1}
                  value={draft.tokensM}
                  onChange={(e) => set({ tokensM: clamp(Number(e.target.value) || 0, 0, MAX_TOKENS_M) })}
                  className="num w-20 rounded-lg border border-line bg-ivory px-2 py-1 text-right text-xl text-ink outline-none focus:border-orange"
                  aria-label="推定消費トークン数（百万単位）"
                />
                <span className="text-sm font-bold text-ink-3">M tokens</span>
              </div>
            </div>
            <input
              id="tokens"
              type="range"
              min={0}
              max={MAX_TOKENS_M}
              step={0.1}
              value={draft.tokensM}
              onChange={(e) => set({ tokensM: Number(e.target.value) })}
              style={{ ["--pct" as string]: `${(draft.tokensM / MAX_TOKENS_M) * 100}%` }}
              className="mt-2"
              aria-valuetext={`${draft.tokensM.toFixed(1)}百万トークン`}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TOKEN_PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className="chip !px-3 !py-1.5 text-xs"
                  data-on={draft.tokensM === m}
                  onClick={() => set({ tokensM: m })}
                >
                  {m.toFixed(1)}M
                </button>
              ))}
            </div>
          </div>

          {/* タグ */}
          <div className="mt-6">
            <div className="text-sm font-bold text-ink">主な作業内容</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {TASK_TAGS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="chip"
                  data-on={draft.tags.includes(t.id)}
                  onClick={() => toggleTag(t.id)}
                  aria-pressed={draft.tags.includes(t.id)}
                >
                  <span aria-hidden>{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* メモ */}
          <div className="mt-5">
            <label htmlFor="memo" className="text-sm font-bold text-ink">
              ひとことメモ <span className="text-xs font-medium text-ink-3">（任意）</span>
            </label>
            <input
              id="memo"
              type="text"
              value={draft.memo}
              onChange={(e) => set({ memo: e.target.value.slice(0, 60) })}
              placeholder="例: 新規SaaS開発・リファクタリング"
              className="mt-1.5 w-full rounded-xl border border-line bg-ivory px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-3/70 focus:border-orange focus:bg-white"
            />
          </div>

          {/* 保存 */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleSave} className="btn-primary relative min-w-[220px]">
              <AnimatePresence mode="wait" initial={false}>
                {justSaved ? (
                  <motion.span
                    key="ok"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Check size={18} />
                    記録しました！
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="inline-flex items-center gap-2"
                  >
                    <Save size={18} />
                    今日のログを記録する
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <span className="text-xs text-ink-3">
              {dirty ? (
                <span className="inline-flex items-center gap-1 text-clay-deep">
                  <Sparkles size={12} /> 未保存の変更あり
                </span>
              ) : savedAt ? (
                `保存済み ${new Date(savedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`
              ) : (
                "LocalStorageに即時保存"
              )}
            </span>
          </div>

          <AnimatePresence>
            {justSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="pointer-events-none absolute -right-2 -top-6 hidden sm:block"
              >
                <ClaudeBuddy size={72} mood="party" prop="flag" />
              </motion.div>
            )}
          </AnimatePresence>
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
        {/* 90% マーカー */}
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

function Stepper({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white text-ink-2 transition hover:border-orange hover:text-orange active:scale-95"
    >
      {icon}
    </button>
  );
}

function r1(n: number) {
  return Math.round(n * 10) / 10;
}
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
