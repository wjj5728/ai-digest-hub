export type SourceRank = {
  tier: "A" | "B" | "C" | "D";
  confidence: number;
};

const A = [
  "openai",
  "openai-blog",
  "anthropic",
  "google-ai",
  "google-deepmind",
  "mistral",
  "mistral-news-page",
  "meta-ai",
  "cohere-blog",
  "microsoft-research-ai",
  "hf",
];
const B = ["github-openai-node"];
const C = ["openai-index"];
const D = ["hn-top"];

export function rankSource(sourceId: string): SourceRank {
  if (A.includes(sourceId)) return { tier: "A", confidence: 90 };
  if (B.includes(sourceId)) return { tier: "B", confidence: 78 };
  if (C.includes(sourceId)) return { tier: "C", confidence: 68 };
  if (D.includes(sourceId)) return { tier: "D", confidence: 58 };
  return { tier: "C", confidence: 60 };
}
