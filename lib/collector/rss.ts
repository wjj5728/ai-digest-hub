import { sources } from "@/lib/config/sources";

export async function collectRss() {
  return {
    collectedAt: Date.now(),
    sourceCount: sources.filter((s) => s.enabled).length,
    items: [] as Array<{ title: string; url: string; sourceId: string }> 
  };
}
