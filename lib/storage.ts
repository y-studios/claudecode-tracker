"use client";

import { useSyncExternalStore } from "react";
import { buildSeedLogs } from "./seed";
import type { DayLog, TrackerState } from "./types";

const KEY = "claudecode-tracker:v1";

const EMPTY: TrackerState = { version: 1, logs: {}, seeded: false };

let cache: TrackerState | null = null;
const listeners = new Set<() => void>();

function read(): TrackerState {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TrackerState;
      if (parsed && parsed.version === 1 && parsed.logs) {
        cache = parsed;
        return cache;
      }
    }
  } catch {
    /* 壊れていたら初期化 */
  }
  // 初回アクセス: サンプルログを投入
  cache = { version: 1, logs: buildSeedLogs(), seeded: true };
  persist(cache);
  return cache;
}

function persist(state: TrackerState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota 超過などは無視 */
  }
}

function write(next: TrackerState) {
  cache = next;
  persist(next);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useTrackerState(): TrackerState {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** SSR/hydration 直後の「まだ localStorage を読んでいない」状態を判定 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const tracker = {
  upsert(log: Omit<DayLog, "updatedAt">) {
    const s = read();
    const prev = s.logs[log.date];
    const next: DayLog = { ...prev, ...log, sample: false, updatedAt: Date.now() };
    write({ ...s, logs: { ...s.logs, [log.date]: next } });
  },
  remove(date: string) {
    const s = read();
    const logs = { ...s.logs };
    delete logs[date];
    write({ ...s, logs });
  },
  clearSamples() {
    const s = read();
    const logs: Record<string, DayLog> = {};
    for (const [k, v] of Object.entries(s.logs)) if (!v.sample) logs[k] = v;
    write({ ...s, logs, seeded: true });
  },
  resetAll() {
    write({ version: 1, logs: {}, seeded: true });
  },
  restoreSamples() {
    const s = read();
    write({ ...s, logs: { ...buildSeedLogs(), ...s.logs }, seeded: true });
  },
  importJSON(text: string): number {
    const parsed = JSON.parse(text) as Partial<TrackerState> | DayLog[];
    const arr: DayLog[] = Array.isArray(parsed)
      ? parsed
      : Object.values((parsed as TrackerState).logs ?? {});
    const s = read();
    const logs = { ...s.logs };
    let n = 0;
    for (const l of arr) {
      if (!l || typeof l.date !== "string" || typeof l.hours !== "number") continue;
      logs[l.date] = {
        date: l.date,
        hours: Math.max(0, Math.min(24, l.hours)),
        tokensM: typeof l.tokensM === "number" ? l.tokensM : 0,
        tags: Array.isArray(l.tags) ? l.tags : [],
        memo: typeof l.memo === "string" ? l.memo : undefined,
        sample: false,
        updatedAt: Date.now(),
      };
      n++;
    }
    write({ ...s, logs, seeded: true });
    return n;
  },
  exportJSON(): string {
    return JSON.stringify(read(), null, 2);
  },
};
