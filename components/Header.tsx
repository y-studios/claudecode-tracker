"use client";

import { Asterisk } from "./claude/Asterisk";
import { ClaudeBuddy } from "./claude/ClaudeBuddy";

const NAV = [
  { href: "#today", label: "今日の記録" },
  { href: "#dashboard", label: "推移" },
  { href: "#rank", label: "称号" },
  { href: "#share", label: "シェア" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-orange text-white shadow-[0_6px_16px_-6px_rgba(234,88,12,0.8)]">
            <Asterisk size={20} weight={0.2} className="animate-spin-slow" />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-black tracking-tight text-ink">Claudecodeの使い手</span>
            <span className="display block text-[10px] font-bold uppercase tracking-[0.18em] text-clay">
              Master of Claude Code
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="ページ内ナビゲーション">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-3.5 py-2 text-sm font-bold text-ink-2 transition hover:bg-orange-tint hover:text-clay-deep"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <ClaudeBuddy size={40} mood="wink" />
          </span>
          <a href="#share" className="btn-primary !px-4 !py-2 text-sm">
            <span className="text-base leading-none">𝕏</span>
            ポストする
          </a>
        </div>
      </div>
    </header>
  );
}
