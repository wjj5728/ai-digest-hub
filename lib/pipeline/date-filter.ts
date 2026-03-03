import type { ScoredItem } from "@/lib/pipeline/score";

function ymdInShanghai(input: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(input);
}

export function keepTodayItems(items: ScoredItem[]) {
  const today = ymdInShanghai(new Date());
  return items.filter((item) => {
    const ts = Date.parse(item.publishedAt || "");
    if (Number.isNaN(ts)) return false;
    return ymdInShanghai(new Date(ts)) === today;
  });
}
