"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { SectionHeading } from "./SectionHeading";
import { TodayCard, type Draft } from "./TodayCard";
import { TrendChart } from "./TrendChart";
import { Heatmap } from "./Heatmap";
import { RankCard } from "./RankCard";
import { ShareCard } from "./ShareCard";
import { HistoryCard } from "./HistoryCard";
import { CtaBand } from "./CtaBand";
import { Footer } from "./Footer";
import { tracker, useHydrated, useTrackerState } from "@/lib/storage";
import { useToday } from "@/lib/useToday";
import { computeBadges, computeRank, computeTotals, currentStreak } from "@/lib/stats";
import type { DayLog } from "@/lib/types";

const EMPTY_DRAFT: Draft = { hours: 0, tokensM: 0, tags: [], memo: "" };

function draftFrom(log?: DayLog): Draft {
  return log
    ? { hours: log.hours, tokensM: log.tokensM, tags: [...log.tags], memo: log.memo ?? "" }
    : EMPTY_DRAFT;
}

function sameDraft(a: Draft, b: Draft) {
  return (
    a.hours === b.hours &&
    a.tokensM === b.tokensM &&
    a.memo === b.memo &&
    a.tags.length === b.tags.length &&
    a.tags.every((t, i) => b.tags[i] === t)
  );
}

export function Dashboard() {
  const state = useTrackerState();
  const hydrated = useHydrated();
  const today = useToday();
  const [draft, setDraft] = useState<Draft | null>(null);

  const ready = hydrated && today !== "";
  const logs = state.logs;
  const savedToday = today ? logs[today] : undefined;
  const effective = draft ?? draftFrom(savedToday);
  const dirty = draft !== null && !sameDraft(draft, draftFrom(savedToday));

  // スライダー操作中はグラフ・統計へ即時反映（Linear風のライブ連動）
  const previewLogs: Record<string, DayLog> =
    dirty && today
      ? {
          ...logs,
          [today]: {
            date: today,
            hours: effective.hours,
            tokensM: effective.tokensM,
            tags: effective.tags,
            memo: effective.memo || undefined,
            updatedAt: savedToday?.updatedAt ?? 0,
          },
        }
      : logs;

  const totals = computeTotals(previewLogs, today || undefined);
  const streak = today ? currentStreak(previewLogs, today) : 0;
  const rank = computeRank(totals.totalHours);
  const badges = today ? computeBadges(previewLogs, today) : [];

  const save = () => {
    if (!today) return;
    tracker.upsert({
      date: today,
      hours: effective.hours,
      tokensM: effective.tokensM,
      tags: effective.tags,
      memo: effective.memo || undefined,
    });
    setDraft(null);
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero todayHours={effective.hours} streak={streak} totals={totals} rank={rank} hydrated={ready} />

        {/* ===== Today ===== */}
        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <SectionHeading id="today" label="本日の消費状況 ＆ クイックログ" title="Today" lead="スライダーを動かした瞬間にゲージとグラフが連動" />
          <div className="mt-6">
            {ready ? (
              <TodayCard
                today={today}
                draft={effective}
                dirty={dirty}
                savedAt={savedToday?.updatedAt}
                onChange={setDraft}
                onSave={save}
              />
            ) : (
              <Skeleton h={520} />
            )}
          </div>
        </section>

        {/* ===== Dashboard (Bento) ===== */}
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <SectionHeading id="dashboard" label="消費量推移ダッシュボード" title="Dashboard" lead="日次・週次の稼働とトークン、草、称号をひと目で" />
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">{ready ? <TrendChart logs={previewLogs} today={today} /> : <Skeleton h={560} />}</div>
            <div className="lg:col-span-1">{ready ? <Heatmap logs={previewLogs} today={today} /> : <Skeleton h={320} />}</div>
            <div id="rank" className="scroll-mt-24 lg:col-span-2">
              {ready ? <RankCard rank={rank} totalHours={totals.totalHours} badges={badges} /> : <Skeleton h={520} />}
            </div>
            <div id="share" className="scroll-mt-24 lg:col-span-1">
              {ready ? <ShareCard todayHours={effective.hours} totals={totals} streak={streak} rank={rank} /> : <Skeleton h={360} />}
            </div>
            <div className="lg:col-span-3">{ready ? <HistoryCard logs={logs} today={today} /> : <Skeleton h={420} />}</div>
          </div>
        </section>

        <div className="mt-16">
          <CtaBand />
        </div>
      </main>
      <Footer />
    </>
  );
}

function Skeleton({ h }: { h: number }) {
  return <div className="card animate-pulse bg-ivory-2/60" style={{ height: h }} aria-hidden />;
}
