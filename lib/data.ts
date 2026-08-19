import usage from "@/data/usage.json";
import type { DayLog } from "./types";

interface UsageFile {
  generatedAt: string;
  logs: Record<string, Omit<DayLog, "date"> & { date: string }>;
}

const file = usage as UsageFile;

export const USAGE_LOGS: Record<string, DayLog> = file.logs;
export const GENERATED_AT: string = file.generatedAt;
