import { sourceCatalog } from "@/lib/config/source-catalog";
import { listSourceSettings } from "@/lib/db/source-settings";

export async function getResolvedSources() {
  const settings = await listSourceSettings();
  const map = new Map(settings.map((x) => [x.id, x]));

  return sourceCatalog.map((item) => {
    const custom = map.get(item.id);
    return {
      ...item,
      enabled: custom?.enabled ?? item.enabled,
      weight: custom?.weight ?? item.weight ?? 0,
    };
  });
}
