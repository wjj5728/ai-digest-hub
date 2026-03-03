export type SourceType = "rss" | "web" | "api";

export type SourceCatalogItem = {
  id: string;
  name: string;
  type: SourceType;
  enabled: boolean;
  url?: string;
  selector?: string;
  weight?: number;
};

export const sourceCatalog: SourceCatalogItem[] = [
  { id: "openai", name: "OpenAI News", type: "rss", url: "https://openai.com/news/rss.xml", enabled: true, weight: 10 },
  { id: "anthropic", name: "Anthropic News", type: "rss", url: "https://www.anthropic.com/news/rss.xml", enabled: true, weight: 10 },
  { id: "google-ai", name: "Google AI Blog", type: "rss", url: "https://blog.google/technology/ai/rss/", enabled: true, weight: 9 },
  { id: "mistral", name: "Mistral News", type: "rss", url: "https://mistral.ai/news/rss.xml", enabled: true, weight: 9 },
  { id: "hf", name: "Hugging Face Blog", type: "rss", url: "https://huggingface.co/blog/feed.xml", enabled: true, weight: 9 },
  { id: "openai-blog", name: "OpenAI Blog", type: "rss", url: "https://openai.com/blog/rss.xml", enabled: true, weight: 8 },
  { id: "google-deepmind", name: "Google DeepMind", type: "rss", url: "https://deepmind.google/discover/blog/rss.xml", enabled: true, weight: 8 },
  { id: "meta-ai", name: "Meta AI Blog", type: "rss", url: "https://ai.meta.com/blog/rss/", enabled: true, weight: 7 },
  { id: "cohere-blog", name: "Cohere Blog", type: "rss", url: "https://cohere.com/blog/rss.xml", enabled: true, weight: 7 },
  { id: "microsoft-research-ai", name: "Microsoft Research AI", type: "rss", url: "https://www.microsoft.com/en-us/research/theme/artificial-intelligence/feed/", enabled: true, weight: 7 },

  { id: "openai-index", name: "OpenAI Index Page", type: "web", url: "https://openai.com/index/", selector: "a[href*='/index/']", enabled: true, weight: 6 },
  { id: "mistral-news-page", name: "Mistral News Page", type: "web", url: "https://mistral.ai/news/", selector: "a[href*='/news/']", enabled: true, weight: 6 },

  { id: "hn-top", name: "Hacker News Top", type: "api", enabled: true, weight: 5 },
  { id: "github-openai-node", name: "GitHub Releases OpenAI Node", type: "api", enabled: true, weight: 6 },
];
