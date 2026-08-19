import { addDays, todayKey } from "./date";
import type { DayLog, TagId } from "./types";

/**
 * 直近14日分の「上限ギリギリまで使い倒した」サンプルログ。
 * 今日の分だけは「作業中」の途中経過として控えめな値にしてある。
 */
const PRESET: Array<{
  ago: number;
  hours: number;
  tokensM: number;
  tags: TagId[];
  memo: string;
}> = [
  { ago: 13, hours: 4.4, tokensM: 3.1, tags: ["research", "spec"], memo: "新規SaaSの要件整理と競合調査" },
  { ago: 12, hours: 4.7, tokensM: 3.4, tags: ["dev", "ui"], memo: "LPとダッシュボードの骨組み実装" },
  { ago: 11, hours: 5.0, tokensM: 4.3, tags: ["dev", "debug"], memo: "認証まわり一気通貫。最後はレート制限待ち" },
  { ago: 10, hours: 4.8, tokensM: 3.8, tags: ["refactor", "test"], memo: "API層リファクタ＋E2Eテスト追加" },
  { ago: 9, hours: 4.6, tokensM: 3.3, tags: ["dev", "spec"], memo: "課金フローの仕様固めと実装" },
  { ago: 8, hours: 5.0, tokensM: 4.5, tags: ["dev", "ui"], memo: "Bento Gridの全カード作り込み" },
  { ago: 7, hours: 4.9, tokensM: 4.0, tags: ["debug", "refactor"], memo: "Recharts連動バグ潰し＆型整理" },
  { ago: 6, hours: 4.7, tokensM: 3.5, tags: ["dev"], memo: "LINE Bot連携と通知ロジック" },
  { ago: 5, hours: 5.0, tokensM: 4.6, tags: ["dev", "test"], memo: "本番デプロイ前の総点検。枠を完全燃焼" },
  { ago: 4, hours: 4.8, tokensM: 3.9, tags: ["ui", "docs"], memo: "UIリライトとREADME整備" },
  { ago: 3, hours: 4.6, tokensM: 3.2, tags: ["spec", "research"], memo: "次プロダクトの要件定義" },
  { ago: 2, hours: 5.0, tokensM: 4.4, tags: ["dev", "debug"], memo: "新規開発フル稼働。5時間パンパン" },
  { ago: 1, hours: 4.9, tokensM: 4.1, tags: ["dev", "ui"], memo: "ダッシュボードUI仕上げ" },
  { ago: 0, hours: 3.4, tokensM: 2.6, tags: ["dev"], memo: "作業中（あとで更新）" },
];

export function buildSeedLogs(endKey = todayKey()): Record<string, DayLog> {
  const now = Date.now();
  const out: Record<string, DayLog> = {};
  for (const p of PRESET) {
    const date = addDays(endKey, -p.ago);
    out[date] = {
      date,
      hours: p.hours,
      tokensM: p.tokensM,
      tags: p.tags,
      memo: p.memo,
      sample: true,
      updatedAt: now - p.ago * 86400000,
    };
  }
  return out;
}
