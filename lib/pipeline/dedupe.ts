import type { CollectedItem } from "@/lib/collector/rss";

export function dedupeItems(items: CollectedItem[]) {
  const seen = new Set<string>();
  const unique: CollectedItem[] = [];

  for (const item of items) {
    const key = item.url.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique;
}
