type DigestInput = {
  title: string;
  trend: string;
  top: Array<{
    titleZh?: string;
    title: string;
    sourceName: string;
    url: string;
    score: number;
    tier?: string;
    confidence?: number;
  }>;
};

export type AudienceMode = "boss" | "tech" | "invest";

export function renderDigestByAudience(input: DigestInput, mode: AudienceMode) {
  const lines = input.top.map((item, idx) => {
    const base = `${idx + 1}) ${item.titleZh || item.title}\n- 来源：${item.sourceName}\n- 信源：${item.tier || "-"} / 置信度 ${item.confidence ?? "-"}\n- 链接：${item.url}`;
    if (mode === "tech") return `${base}\n- 技术点：评分 ${item.score}，建议关注实现细节。`;
    if (mode === "invest") return `${base}\n- 商业点：建议关注落地与成本效率信号。`;
    return `${base}\n- 业务点：优先关注对团队与产品的直接影响。`;
  });

  const header =
    mode === "tech"
      ? "技术版日报"
      : mode === "invest"
        ? "投资版日报"
        : "老板版日报";

  return {
    title: `${input.title} - ${header}`,
    body: `${lines.join("\n\n")}\n\n趋势：${input.trend}`,
  };
}
