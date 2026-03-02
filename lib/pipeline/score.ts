import type { CollectedItem } from "@/lib/collector/rss";

export type ScoredItem = CollectedItem & {
  score: number;
  tags: string[];
};

const KEYWORDS: Array<{ tag: string; words: string[]; weight: number }> = [
  { tag: "model", words: ["model", "release", "gemini", "gpt", "llm"], weight: 4 },
  { tag: "product", words: ["launch", "update", "feature", "tool"], weight: 3 },
  { tag: "policy", words: ["policy", "safety", "compliance", "regulation"], weight: 3 },
  { tag: "infra", words: ["inference", "training", "latency", "benchmark"], weight: 2 },
];

export function scoreItems(items: CollectedItem[]) {
  const now = Date.now();

  return items.map((item) => {
    const text = `${item.title} ${item.url}`.toLowerCase();
    const tags: string[] = [];
    let score = 1;

    for (const rule of KEYWORDS) {
      if (rule.words.some((w) => text.includes(w))) {
        score += rule.weight;
        tags.push(rule.tag);
      }
    }

    const ts = Date.parse(item.publishedAt || "");
    if (!Number.isNaN(ts)) {
      const ageHours = Math.max(0, (now - ts) / 3_600_000);
      if (ageHours <= 24) score += 2;
      else if (ageHours <= 72) score += 1;
    }

    return { ...item, score, tags } as ScoredItem;
  });
}
