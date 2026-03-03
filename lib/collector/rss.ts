import { XMLParser } from "fast-xml-parser";

import { extraRssSources } from "@/lib/config/extra-sources";
import { sources } from "@/lib/config/sources";

export type CollectedItem = {
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  publishedAt: string;
};

function pickItems(payload: any) {
  const channelItems = payload?.rss?.channel?.item;
  const feedItems = payload?.feed?.entry;
  if (Array.isArray(channelItems)) return channelItems;
  if (channelItems) return [channelItems];
  if (Array.isArray(feedItems)) return feedItems;
  if (feedItems) return [feedItems];
  return [];
}

function normalizeItem(item: any) {
  const title = String(item?.title?.["#text"] || item?.title || "").trim();
  const url = String(
    item?.link?.href || item?.link?.["@_href"] || item?.link || item?.guid || "",
  ).trim();
  const publishedAt = String(item?.pubDate || item?.published || item?.updated || "").trim();

  return { title, url, publishedAt };
}

export async function collectRss() {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const enabled = [...sources, ...extraRssSources].filter((s) => s.enabled);
  const allItems: CollectedItem[] = [];
  const errors: Array<{ sourceId: string; message: string }> = [];

  for (const source of enabled) {
    try {
      const response = await fetch(source.url, { cache: "no-store" });
      if (!response.ok) {
        errors.push({ sourceId: source.id, message: `HTTP ${response.status}` });
        continue;
      }

      const xml = await response.text();
      const data = parser.parse(xml);
      const items = pickItems(data);

      for (const raw of items.slice(0, 20)) {
        const item = normalizeItem(raw);
        if (!item.title || !item.url) continue;
        allItems.push({
          sourceId: source.id,
          sourceName: source.name,
          title: item.title,
          url: item.url,
          publishedAt: item.publishedAt,
        });
      }
    } catch (error) {
      errors.push({ sourceId: source.id, message: error instanceof Error ? error.message : "unknown" });
    }
  }

  return {
    collectedAt: Date.now(),
    sourceCount: enabled.length,
    itemCount: allItems.length,
    items: allItems,
    errors,
  };
}
