import type { ScoredItem } from "@/lib/pipeline/score";

export function buildDailyMetrics(items: ScoredItem[]) {
  const today = new Date().toISOString().slice(0, 10);
  const bucket = { A: 0, B: 0, C: 0, D: 0 };

  for (const item of items) {
    if (item.tier in bucket) {
      bucket[item.tier as keyof typeof bucket] += 1;
    }
  }

  return {
    date: today,
    total: items.length,
    aCount: bucket.A,
    bCount: bucket.B,
    cCount: bucket.C,
    dCount: bucket.D,
  };
}
