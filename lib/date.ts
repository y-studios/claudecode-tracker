// このアプリの「日付」は常に Asia/Tokyo 基準。ビルドは GitHub Actions(UTC)でも
// ローカルMac(JST)でも走るため、実行環境のタイムゾーンに依存しない実装にしてある。
const APP_TZ = "Asia/Tokyo";

/** 各日付キーを「その日のUTC正午」に固定して、日数演算(±n日)を安全にする */
export function fromKey(key: string): Date {
  return new Date(`${key}T12:00:00Z`);
}

export function toKey(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const m = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${m.year}-${m.month}-${m.day}`;
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, n: number): string {
  const d = fromKey(key);
  d.setUTCDate(d.getUTCDate() + n);
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

// fromKey が UTC正午に固定しているため、JST(+9)/UTC(+0)いずれの実行環境でも
// ネイティブの getDate()/getDay() 系メソッドは同じ暦日を指す。
export function formatMD(key: string): string {
  const d = fromKey(key);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

export function formatLong(key: string): string {
  const d = fromKey(key);
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日（${WEEKDAYS_JA[d.getUTCDay()]}）`;
}

export function weekdayOf(key: string): string {
  return WEEKDAYS_JA[fromKey(key).getUTCDay()];
}
