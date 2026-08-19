import { Header } from "./Header";
import { Hero } from "./Hero";
import { SectionHeading } from "./SectionHeading";
import { TodaySnapshot } from "./TodaySnapshot";
import { TrendChart } from "./TrendChart";
import { Heatmap } from "./Heatmap";
import { RankCard } from "./RankCard";
import { ShareCard } from "./ShareCard";
import { RecentLog } from "./RecentLog";
import { CtaBand } from "./CtaBand";
import { Footer } from "./Footer";
import { USAGE_LOGS, GENERATED_AT } from "@/lib/data";
import { todayKey } from "@/lib/date";
import { computeBadges, computeRank, computeTotals, currentStreak } from "@/lib/stats";

function syncedAgoLabel(generatedAt: string): string {
  const diffMin = Math.max(0, Math.round((Date.now() - new Date(generatedAt).getTime()) / 60000));
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m === 0 ? `${h}時間前` : `${h}時間${m}分前`;
}

export function Dashboard() {
  const today = todayKey();
  const logs = USAGE_LOGS;
  const todayLog = logs[today];
  const hours = todayLog?.hours ?? 0;
  const tokensM = todayLog?.tokensM ?? 0;

  const totals = computeTotals(logs, today);
  const streak = currentStreak(logs, today);
  const rank = computeRank(totals.totalHours);
  const badges = computeBadges(logs, today);
  const syncedAgo = syncedAgoLabel(GENERATED_AT);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero todayHours={hours} streak={streak} totals={totals} rank={rank} syncedAgo={syncedAgo} />

        {/* ===== Today ===== */}
        <section className="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <SectionHeading id="today" label="本日の実測状況" title="Today" lead={`最終同期: ${syncedAgo}`} />
          <div className="mt-6">
            <TodaySnapshot today={today} hours={hours} tokensM={tokensM} syncedAgo={syncedAgo} />
          </div>
        </section>

        {/* ===== Dashboard (Bento) ===== */}
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <SectionHeading id="dashboard" label="消費量推移ダッシュボード" title="Dashboard" lead="日次・週次の稼働とトークン、草、称号をひと目で" />
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TrendChart logs={logs} today={today} />
            </div>
            <div className="lg:col-span-1">
              <Heatmap logs={logs} today={today} />
            </div>
            <div id="rank" className="scroll-mt-24 lg:col-span-2">
              <RankCard rank={rank} totalHours={totals.totalHours} badges={badges} />
            </div>
            <div id="share" className="scroll-mt-24 lg:col-span-1">
              <ShareCard todayHours={hours} totals={totals} streak={streak} rank={rank} />
            </div>
            <div className="lg:col-span-3">
              <RecentLog logs={logs} today={today} />
            </div>
          </div>
        </section>

        <div className="mt-16">
          <CtaBand syncedAgo={syncedAgo} />
        </div>
      </main>
      <Footer />
    </>
  );
}
