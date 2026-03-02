export function dedupeItems<T extends { url?: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url || JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
