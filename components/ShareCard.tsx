"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";
import { LIMIT_HOURS } from "@/lib/types";
import { siteUrl } from "@/lib/format";
import type { Rank, Totals } from "@/lib/stats";

interface Props {
  todayHours: number;
  totals: Totals;
  streak: number;
  rank: Rank;
}

export function buildShareText({ todayHours, totals, streak, rank }: Props): string {
  const pct = Math.round((todayHours / LIMIT_HOURS) * 100);
  const lines = [
    `今日のClaude Code稼働: ${todayHours.toFixed(1)}h/${LIMIT_HOURS.toFixed(1)}h (${pct}%)！`,
    `今月累計${totals.monthHours.toFixed(1)}時間${streak > 0 ? `・${streak}日連続で上限到達` : ""}🔥`,
    `ランク: ${rank.emoji}${rank.name}`,
    `我こそはClaude Codeの使い手！ #Claudecodeの使い手`,
  ];
  return lines.join("\n");
}

export function ShareCard(props: Props) {
  const [copied, setCopied] = useState(false);
  const text = buildShareText(props);
  const url = siteUrl();

  const open = () => {
    const intent = `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer,width=600,height=640");
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-ink">𝕏 ワンタップシェア</h3>
          <p className="mt-0.5 text-xs text-ink-3">今日の消費をそのままポスト</p>
        </div>
        <ClaudeBuddy size={48} mood="wink" prop="megaphone" />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-ivory p-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-orange text-white text-sm font-black">✳</span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-ink">あなた</div>
            <div className="text-[11px] text-ink-3">@you · たった今</div>
          </div>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{text}</p>
        <p className="mt-2 truncate text-xs text-clay underline decoration-clay/40">{url}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button type="button" onClick={open} className="btn-primary w-full !bg-ink hover:!bg-black">
          <span className="text-base leading-none">𝕏</span>
          今日のClaude Code消費をポスト
          <ExternalLink size={14} className="opacity-70" />
        </button>
        <button type="button" onClick={copy} className="btn-ghost w-full !py-2.5 text-sm">
          {copied ? <Check size={16} className="text-good" /> : <Copy size={16} />}
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
      <p className="mt-2 text-[10px] text-ink-3">Xの投稿画面が別ウィンドウで開きます（この場では投稿されません）</p>
    </div>
  );
}
