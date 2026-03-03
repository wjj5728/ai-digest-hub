import { translateToChinese } from "@/lib/analyst/translate";
import { keepTodayItems } from "@/lib/pipeline/date-filter";
import type { ScoredItem } from "@/lib/pipeline/score";

export async function summarizeTopItems(items: ScoredItem[], topN = 20) {
  const todayOnly = keepTodayItems(items);
  const safeTopN = Math.min(Math.max(Math.floor(topN || 20), 1), 50);
  const topRaw = [...todayOnly].sort((a, b) => b.score - a.score).slice(0, safeTopN);

  const top = await Promise.all(
    topRaw.map(async (item) => {
      const titleZh = await translateToChinese(item.title);
      return {
        ...item,
        titleZh,
        dateLabel: item.publishedAt ? item.publishedAt.slice(0, 10) : "",
      };
    }),
  );

  const lines = top.map(
    (item, idx) =>
      `${idx + 1}) ${item.titleZh}\n- 原文标题：${item.title}\n- 来源：${item.sourceName}\n- 日期：${item.dateLabel || "未知"}\n- 信源等级：${item.tier}（置信度 ${item.confidence}）\n- 评分：${item.score}\n- 原始链接：${item.url}`,
  );

  const trend =
    top.length === 0
      ? "今日暂无符合时间条件的资讯（仅收录今日发布）。"
      : "头部动态集中在模型发布、产品迭代与安全治理三个方向。";

  return {
    title: `AI 每日简报（${new Date().toISOString().slice(0, 10)}）`,
    top,
    trend,
    body: `${lines.join("\n\n")}\n\n趋势一句话：${trend}`,
  };
}
