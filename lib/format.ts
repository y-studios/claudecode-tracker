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

export function siteUrl(): string {
  if (typeof window === "undefined") return "";
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${window.location.origin}${base}/`;
}
