"use client";

import { useEffect, useMemo, useState } from "react";

type Topic = { tag: string; count: number };
type Item = {
  title: string;
  titleZh?: string;
  sourceName: string;
  score: number;
  url: string;
  tier?: "A" | "B" | "C" | "D";
  confidence?: number;
};
type DigestRow = { id: string; createdAt: number; title: string; body: string };

async function requestJson(url: string, init?: RequestInit) {
  const res = await fetch(url, init);
  const text = await res.text();

  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text.slice(0, 200) };
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || `${url} failed: HTTP ${res.status}`);
  }

  return data;
}

function badgeStyle(value: string) {
  const base = {
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 12,
    border: "1px solid #2b3448",
    display: "inline-block",
  } as const;

  if (value === "sent") return { ...base, color: "#32d583", borderColor: "#1d5f41" };
  if (value === "mocked") return { ...base, color: "#fdb022", borderColor: "#7a5717" };
  if (value === "failed") return { ...base, color: "#f97066", borderColor: "#7a2b28" };
  return { ...base, color: "#98a2b3" };
}

function tierStyle(tier?: string) {
  const map: Record<string, string> = { A: "#32d583", B: "#6ce9a6", C: "#fdb022", D: "#f97066" };
  return { color: map[tier || ""] || "#98a2b3", fontWeight: 700 };
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("idle");
  const [error, setError] = useState("");

  const [rawCount, setRawCount] = useState(0);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [top, setTop] = useState<Item[]>([]);
  const [trend, setTrend] = useState("");
  const [publishStatus, setPublishStatus] = useState("-");
  const [digests, setDigests] = useState<DigestRow[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<DigestRow | null>(null);
  const [configStatus, setConfigStatus] = useState<{ hasApiKey?: boolean; mode?: string; baseUrl?: string; model?: string }>({});

  async function loadDigestHistory() {
    const data = await requestJson("/api/digest/list?limit=10");
    setDigests(data.rows || []);
  }

  async function openDigestDetail(id: string) {
    const data = await requestJson(`/api/digest/${id}`);
    setSelectedDigest(data.row || null);
  }

  async function checkConfig() {
    const data = await requestJson("/api/config-check");
    setConfigStatus({
      hasApiKey: data.hasApiKey,
      mode: data.mode,
      baseUrl: data.baseUrl,
      model: data.model,
    });
  }

  async function runCollect() {
    setStage("collect");
    const data = await requestJson("/api/collect", { method: "POST" });
    setRawCount(data.rawCount || 0);
    setUniqueCount(data.uniqueCount || 0);
  }

  async function runAnalyze() {
    setStage("analyze");
    const data = await requestJson("/api/analyze", { method: "POST" });
    setRawCount(data.rawCount || 0);
    setUniqueCount(data.uniqueCount || 0);
    setTopics(data.topics || []);
    setTop(data.digest?.top || []);
    setTrend(data.digest?.trend || "");
  }

  async function runDigest() {
    setStage("digest");
    const data = await requestJson("/api/digest", { method: "POST" });
    setTopics(data.topics || []);
    setTop(data.digest?.top || []);
    setTrend(data.digest?.trend || "");
    await loadDigestHistory();
  }

  async function runPublish() {
    setStage("publish");
    const data = await requestJson("/api/publish", { method: "POST" });
    setPublishStatus(data.result?.status || "-");
  }

  async function runAll() {
    setLoading(true);
    setError("");
    try {
      await runCollect();
      await runAnalyze();
      await runDigest();
      await runPublish();
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
      setStage("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDigestHistory().catch(() => undefined);
  }, []);

  const aTierCount = useMemo(() => top.filter((x) => x.tier === "A").length, [top]);
  const aTierRate = top.length ? `${Math.round((aTierCount / top.length) * 100)}%` : "-";

  return (
    <main style={{ maxWidth: 1240, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>AI Digest Hub</h1>
      <p style={{ marginTop: 0, color: "#98a2b3" }}>v1.0.5 产品化面板：KPI + 卡片流 + 历史记录表</p>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
        <div style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 12, background: "#121a2d" }}>
          <div style={{ color: "#98a2b3", fontSize: 12 }}>采集条数</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{rawCount}</div>
        </div>
        <div style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 12, background: "#121a2d" }}>
          <div style={{ color: "#98a2b3", fontSize: 12 }}>去重后</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{uniqueCount}</div>
        </div>
        <div style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 12, background: "#121a2d" }}>
          <div style={{ color: "#98a2b3", fontSize: 12 }}>A级占比</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{aTierRate}</div>
        </div>
        <div style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 12, background: "#121a2d" }}>
          <div style={{ color: "#98a2b3", fontSize: 12 }}>分发状态</div>
          <div style={{ marginTop: 6 }}><span style={badgeStyle(publishStatus)}>{publishStatus}</span></div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <section style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 14, background: "#121a2d" }}>
          <h2 style={{ marginTop: 0 }}>今日 Top5</h2>
          <p style={{ color: "#98a2b3" }}>趋势：{trend || "点击全流程生成后显示"}</p>
          <div style={{ display: "grid", gap: 10 }}>
            {top.length === 0 && <div style={{ color: "#98a2b3" }}>暂无数据</div>}
            {top.map((x, i) => (
              <article key={i} style={{ border: "1px solid #2b3448", borderRadius: 10, padding: 10 }}>
                <div style={{ fontWeight: 700 }}>{x.titleZh || x.title}</div>
                <div style={{ color: "#98a2b3", marginTop: 4, fontSize: 13 }}>
                  {x.sourceName} | 评分 {x.score} | 信源 <span style={tierStyle(x.tier)}>{x.tier || "-"}</span> | 置信度 {x.confidence ?? "-"}
                </div>
                <a href={x.url} target="_blank" rel="noreferrer" style={{ color: "#84caff", fontSize: 13 }}>原始链接</a>
              </article>
            ))}
          </div>

          <h3>主题统计</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {topics.length === 0 && <span style={{ color: "#98a2b3" }}>暂无</span>}
            {topics.map((t) => (
              <span key={t.tag} style={{ border: "1px solid #2b3448", borderRadius: 999, padding: "4px 10px" }}>
                {t.tag}: {t.count}
              </span>
            ))}
          </div>
        </section>

        <section style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 14, background: "#121a2d" }}>
          <h2 style={{ marginTop: 0 }}>控制台</h2>
          <p>阶段：{stage}</p>
          <p>模式：{configStatus.mode || "未检测"}</p>
          <p>模型：{configStatus.model || "-"}</p>
          {error && <p style={{ color: "#f97066" }}>错误：{error}</p>}
          <div style={{ display: "grid", gap: 8 }}>
            <button onClick={runAll} disabled={loading}>{loading ? "执行中..." : "全流程生成"}</button>
            <button onClick={checkConfig} disabled={loading}>检测模型配置</button>
            <button onClick={runCollect} disabled={loading}>仅采集</button>
            <button onClick={runAnalyze} disabled={loading}>仅分析</button>
            <button onClick={runDigest} disabled={loading}>仅生成日报</button>
            <button onClick={runPublish} disabled={loading}>仅分发</button>
          </div>
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
        <section style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 14, background: "#121a2d" }}>
          <h2 style={{ marginTop: 0 }}>历史日报</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "#98a2b3", textAlign: "left" }}>
                <th style={{ paddingBottom: 8 }}>时间</th>
                <th style={{ paddingBottom: 8 }}>标题</th>
              </tr>
            </thead>
            <tbody>
              {digests.length === 0 && (
                <tr><td colSpan={2} style={{ color: "#98a2b3" }}>暂无历史</td></tr>
              )}
              {digests.map((d) => (
                <tr key={d.id}>
                  <td style={{ padding: "6px 0", color: "#98a2b3" }}>{new Date(d.createdAt).toLocaleString("zh-CN")}</td>
                  <td style={{ padding: "6px 0" }}>
                    <button
                      style={{ background: "transparent", border: 0, color: "#e8eefc", cursor: "pointer", padding: 0, textAlign: "left" }}
                      onClick={() => openDigestDetail(d.id)}
                    >
                      {d.title}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 14, background: "#121a2d" }}>
          <h2 style={{ marginTop: 0 }}>日报正文</h2>
          {!selectedDigest && <p style={{ color: "#98a2b3" }}>点击左侧历史日报查看正文。</p>}
          {selectedDigest && <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 13 }}>{selectedDigest.body}</pre>}
        </section>
      </div>
    </main>
  );
}
