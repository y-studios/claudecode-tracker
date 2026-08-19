export const LIMIT_HOURS = 5.0;
/** この割合以上で「上限到達（パンパン）」扱い */
export const REACH_RATIO = 0.9;
export const MAX_TOKENS_M = 10; // スライダー上限（百万トークン）

export const TASK_TAGS = [
  { id: "dev", label: "新規開発", emoji: "🚀" },
  { id: "debug", label: "デバッグ", emoji: "🐛" },
  { id: "ui", label: "UIリライト", emoji: "🎨" },
  { id: "spec", label: "要件定義", emoji: "📄" },
  { id: "refactor", label: "リファクタ", emoji: "♻️" },
  { id: "test", label: "テスト", emoji: "🧪" },
  { id: "research", label: "調査", emoji: "🔍" },
  { id: "docs", label: "ドキュメント", emoji: "📝" },
] as const;

export type TagId = (typeof TASK_TAGS)[number]["id"];

export interface DayLog {
  /** YYYY-MM-DD (ローカル日付) */
  date: string;
  /** 稼働時間 0.0〜5.0 (0.1刻み) */
  hours: number;
  /** 推定消費トークン（百万単位, 小数1桁） */
  tokensM: number;
  tags: TagId[];
  memo?: string;
  /** 初期プリセットのサンプルログかどうか */
  sample?: boolean;
  updatedAt: number;
}

export interface TrackerState {
  version: 1;
  logs: Record<string, DayLog>;
  /** サンプルログを投入済みか（一度消したら再投入しない） */
  seeded: boolean;
}
