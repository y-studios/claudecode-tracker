export const LIMIT_HOURS = 5.0;
/** この割合以上で「上限到達（パンパン）」扱い */
export const REACH_RATIO = 0.9;

export interface DayLog {
  /** YYYY-MM-DD (Asia/Tokyo基準) */
  date: string;
  /** 実測の稼働時間（h）。5時間を超えることもある */
  hours: number;
  /** 実測の推定消費トークン（百万単位） */
  tokensM: number;
}
