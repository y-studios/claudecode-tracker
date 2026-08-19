"use client";

import { useSyncExternalStore } from "react";
import { todayKey } from "./date";

function subscribe(cb: () => void) {
  // 日付またぎを拾うため1分ごとに再評価（値が同じなら再レンダーされない）
  const id = window.setInterval(cb, 60_000);
  const onVis = () => cb();
  document.addEventListener("visibilitychange", onVis);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", onVis);
  };
}

/** クライアントのローカル日付キー。SSR/hydration中は "" を返す */
export function useToday(): string {
  return useSyncExternalStore(subscribe, todayKey, () => "");
}
