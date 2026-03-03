import { load } from "cheerio";

import { getResolvedSources } from "@/lib/config/sources-runtime";

export type WebCollectedItem = {
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  publishedAt: string;
};

export async function collectWeb() {
  const items: WebCollectedItem[] = [];
  const errors: Array<{ sourceId: string; message: string }> = [];
  const webSources = (await getResolvedSources()).filter(
    (s) => s.type === "web" && s.enabled && s.url && s.selector,
  );

  for (const source of webSources) {
    try {
      const sourceUrl = source.url as string;
      const selector = source.selector as string;
      const res = await fetch(sourceUrl, { cache: "no-store" });
      if (!res.ok) {
        errors.push({ sourceId: source.id, message: `HTTP ${res.status}` });
        continue;
      }

      const html = await res.text();
      const $ = load(html);
      $(selector)
        .slice(0, 20)
        .each((_idx, el) => {
          const title = $(el).text().replace(/\s+/g, " ").trim();
          const href = $(el).attr("href") || "";
          if (!title || !href) return;
          const url = href.startsWith("http") ? href : new URL(href, sourceUrl).toString();
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
