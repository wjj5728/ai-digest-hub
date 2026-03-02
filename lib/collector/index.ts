import { collectFromApis } from "@/lib/collector/api";
import { collectRss } from "@/lib/collector/rss";
import { collectWeb } from "@/lib/collector/web";

export async function collectAllSources() {
  const [rss, web, api] = await Promise.all([collectRss(), collectWeb(), collectFromApis()]);

  const items = [...rss.items, ...web.items, ...api.items];
  const errors = [...rss.errors, ...web.errors, ...api.errors];

  return {
    collectedAt: Date.now(),
    sourceCount: rss.sourceCount + 2 + 2,
    itemCount: items.length,
    items,
    errors,
    breakdown: {
      rss: rss.itemCount,
      web: web.itemCount,
      api: api.itemCount,
    },
  };
}
