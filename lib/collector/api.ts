import { getResolvedSources } from "@/lib/config/sources-runtime";

export type ApiCollectedItem = {
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  publishedAt: string;
};

export async function collectFromApis() {
  const items: ApiCollectedItem[] = [];
  const errors: Array<{ sourceId: string; message: string }> = [];
  const enabledIds = new Set(
    (await getResolvedSources()).filter((s) => s.type === "api" && s.enabled).map((s) => s.id),
  );

  if (enabledIds.has("hn-top")) {
    try {
      const hn = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", { cache: "no-store" });
      if (hn.ok) {
        const ids = ((await hn.json()) as number[]).slice(0, 8);
        for (const id of ids) {
          const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { cache: "no-store" });
          if (!itemRes.ok) continue;
          const item = await itemRes.json();
          if (!item?.title || !item?.url) continue;
          items.push({
            sourceId: "hn-top",
            sourceName: "Hacker News Top",
            title: item.title,
            url: item.url,
            publishedAt: item.time ? new Date(item.time * 1000).toISOString() : "",
          });
        }
      } else {
        errors.push({ sourceId: "hn-top", message: `HTTP ${hn.status}` });
      }
    } catch (error) {
      errors.push({ sourceId: "hn-top", message: error instanceof Error ? error.message : "unknown" });
    }
  }

  if (enabledIds.has("github-openai-node")) {
    try {
      const gh = await fetch("https://api.github.com/repos/openai/openai-node/releases", {
        cache: "no-store",
        headers: { "User-Agent": "ai-digest-hub" },
      });
      if (gh.ok) {
        const list = (await gh.json()) as Array<{ name?: string; html_url?: string; published_at?: string }>;
        for (const rel of list.slice(0, 5)) {
          if (!rel.name || !rel.html_url) continue;
          items.push({
            sourceId: "github-openai-node",
            sourceName: "GitHub Releases",
            title: `OpenAI Node Release: ${rel.name}`,
            url: rel.html_url,
            publishedAt: rel.published_at || "",
          });
        }
      } else {
        errors.push({ sourceId: "github-openai-node", message: `HTTP ${gh.status}` });
      }
    } catch (error) {
      errors.push({ sourceId: "github-openai-node", message: error instanceof Error ? error.message : "unknown" });
    }
  }

  return { itemCount: items.length, items, errors };
}
