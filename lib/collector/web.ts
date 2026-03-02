import { load } from "cheerio";

export type WebCollectedItem = {
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  publishedAt: string;
};

const webSources = [
  {
    id: "openai-index",
    name: "OpenAI Index",
    url: "https://openai.com/index/",
    selector: "a[href*='/index/']",
  },
  {
    id: "mistral-news-page",
    name: "Mistral News Page",
    url: "https://mistral.ai/news/",
    selector: "a[href*='/news/']",
  },
];

export async function collectWeb() {
  const items: WebCollectedItem[] = [];
  const errors: Array<{ sourceId: string; message: string }> = [];

  for (const source of webSources) {
    try {
      const res = await fetch(source.url, { cache: "no-store" });
      if (!res.ok) {
        errors.push({ sourceId: source.id, message: `HTTP ${res.status}` });
        continue;
      }

      const html = await res.text();
      const $ = load(html);
      $(source.selector)
        .slice(0, 20)
        .each((_idx, el) => {
          const title = $(el).text().replace(/\s+/g, " ").trim();
          const href = $(el).attr("href") || "";
          if (!title || !href) return;
          const url = href.startsWith("http") ? href : new URL(href, source.url).toString();
          items.push({
            sourceId: source.id,
            sourceName: source.name,
            title,
            url,
            publishedAt: "",
          });
        });
    } catch (error) {
      errors.push({ sourceId: source.id, message: error instanceof Error ? error.message : "unknown" });
    }
  }

  return { itemCount: items.length, items, errors };
}
