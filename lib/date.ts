/** ローカル日付を YYYY-MM-DD に */
export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

/** 末尾が today の、長さ n の日付キー配列（古い→新しい） */
export function lastNDays(n: number, endKey = todayKey()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(endKey, -i));
  return out;
}

export function monthKey(key: string): string {
  return key.slice(0, 7);
}

export const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function formatMD(key: string): string {
  const d = fromKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatLong(key: string): string {
  const d = fromKey(key);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAYS_JA[d.getDay()]}）`;
}
