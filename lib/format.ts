export function fmtHours(h: number): string {
  return `${h.toFixed(1)}h`;
}

/** 百万トークン → "48.2M" / "980K" */
export function fmtTokensM(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)}B`;
  if (m >= 1) return `${m.toFixed(1)}M`;
  return `${Math.round(m * 1000)}K`;
}

export function fmtPct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function hoursToHM(h: number): string {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  if (hh === 0) return `${mm}分`;
  if (mm === 0) return `${hh}時間`;
  return `${hh}時間${mm}分`;
}

/** ビルド時に埋め込まれた環境変数から組み立てる（windowを参照しないためSSR/CSRで差異が出ない） */
export function siteUrl(): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://y-studios.github.io").replace(/\/$/, "");
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${origin}${base}/`;
}
