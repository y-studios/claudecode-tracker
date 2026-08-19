"use client";

import { RefreshCw, Share2 } from "lucide-react";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";
import { Asterisk } from "./claude/Asterisk";

export function CtaBand({ syncedAgo }: { syncedAgo: string }) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-orange-bright via-orange to-clay-deep px-5 py-10 text-white shadow-[0_30px_60px_-30px_rgba(234,88,12,0.6)] sm:px-10 sm:py-14">
        <Asterisk size={260} weight={0.14} className="pointer-events-none absolute -left-16 -top-20 text-white/10" />
        <Asterisk size={180} weight={0.14} className="pointer-events-none absolute -bottom-14 right-10 text-white/10 animate-spin-slow" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              <Asterisk size={12} weight={0.24} /> Claudecodeの使い手
            </div>
            <h2 className="display mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              今日も5時間枠、使い切った？
              <br />
              実測データが、勝手に見せびらかす。
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85">
              Claude Codeのローカルログを1時間ごとに自動集計。手を動かすのはX投稿ボタンだけ。
              連続上限到達と称号ランクで、毎日のフル稼働がちょっと楽しくなる。
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-ink shadow-lg">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-tint text-orange">
                  <RefreshCw size={20} />
                </span>
                <span>
                  <span className="block text-sm font-black">自動更新中</span>
                  <span className="block text-[11px] text-ink-3">最終同期: {syncedAgo}</span>
                </span>
              </div>
              <a href="#share" className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-ink shadow-lg transition hover:-translate-y-0.5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-white">
                  <Share2 size={20} />
                </span>
                <span>
                  <span className="block text-sm font-black">𝕏 でシェアする</span>
                  <span className="block text-[11px] text-ink-3">#Claudecodeの使い手</span>
                </span>
              </a>
            </div>
          </div>
          <div className="relative mx-auto hidden lg:block">
            <div className="speech speech-right mb-3 max-w-[220px] text-sm font-bold text-ink">
              5時間完走お疲れ様！今日もよく使い倒したね✳️
            </div>
            <ClaudeBuddy size={200} mood="party" prop="trophy" float />
          </div>
        </div>
      </div>
    </section>
  );
}
