import type { ScoredItem } from "@/lib/pipeline/score";

export function summarizeTopItems(items: ScoredItem[]) {
  const top = [...items].sort((a, b) => b.score - a.score).slice(0, 5);

  const lines = top.map(
    (item, idx) =>
      `${idx + 1}) ${item.title}\n- 来源：${item.sourceName}\n- 评分：${item.score}\n- 链接：${item.url}`,
  );

  const trend =
    top.length === 0
      ? "今日暂无有效资讯。"
      : "头部动态集中在模型发布、产品迭代与安全治理三个方向。";

  return {
    title: `AI 每日简报（${new Date().toISOString().slice(0, 10)}）`,
    top,
    trend,
    body: `${lines.join("\n\n")}\n\n趋势一句话：${trend}`,
  };
}
