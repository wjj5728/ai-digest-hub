import type { ScoredItem } from "@/lib/pipeline/score";

export function buildTopicStats(items: ScoredItem[]) {
  const bucket = new Map<string, number>();

  for (const item of items) {
    for (const tag of item.tags) {
      bucket.set(tag, (bucket.get(tag) || 0) + 1);
    }
  }

  return [...bucket.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
