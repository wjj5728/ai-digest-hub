"use client";

import { useEffect, useMemo, useState } from "react";

type Topic = { tag: string; count: number };
type Item = { title: string; titleZh?: string; sourceName: string; score: number; url: string };
type DigestRow = { id: string; createdAt: number; title: string; body: string };

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

  async function loadDigestHistory() {
    const res = await fetch("/api/digest/list?limit=10");
    const data = await res.json();
    setDigests(data.rows || []);
  }

  async function runCollect() {
    setStage("collect");
    const res = await fetch("/api/collect", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "collect failed");
    setRawCount(data.rawCount || 0);
    setUniqueCount(data.uniqueCount || 0);
  }

  async function runAnalyze() {
    setStage("analyze");
    const res = await fetch("/api/analyze", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "analyze failed");

    setRawCount(data.rawCount || 0);
    setUniqueCount(data.uniqueCount || 0);
    setTopics(data.topics || []);
    setTop(data.digest?.top || []);
    setTrend(data.digest?.trend || "");
  }

  async function runDigest() {
    setStage("digest");
    const res = await fetch("/api/digest", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "digest failed");

    setTopics(data.topics || []);
    setTop(data.digest?.top || []);
    setTrend(data.digest?.trend || "");
    await loadDigestHistory();
  }

  async function runPublish() {
    setStage("publish");
    const res = await fetch("/api/publish", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "publish failed");
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

  const statusColor = useMemo(() => {
    if (publishStatus === "sent") return "#32d583";
    if (publishStatus === "mocked") return "#fdb022";
    if (publishStatus === "failed") return "#f97066";
    return "#98a2b3";
  }, [publishStatus]);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>AI Digest Hub</h1>
      <p style={{ marginTop: 0, color: "#98a2b3" }}>v0.7.0 前端控制台：采集、分析、生成、分发一站式操作</p>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <section style={{ border: "1px solid #2b3448", borderRadius: 12, padding: 14, background: "#121a2d" }}>
          <h2 style={{ marginTop: 0 }}>今日摘要</h2>
          <p style={{ color: "#98a2b3" }}>趋势：{trend || "点击全流程生成后显示"}</p>
          <ul>
            {top.length === 0 && <li>暂无数据</li>}
            {top.map((x, i) => (
              <li key={i} style={{ marginBottom: 10 }}>
                <strong>{x.titleZh || x.title}</strong>
                <div style={{ color: "#98a2b3" }}>{x.sourceName} | 评分 {x.score}</div>
                <a href={x.url} target="_blank" rel="noreferrer" style={{ color: "#84caff", fontSize: 13 }}>
                  原文链接
                </a>
              </li>
            ))}
          </ul>

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
          <h2 style={{ marginTop: 0 }}>任务状态</h2>
          <p>阶段：{stage}</p>
          <p>采集：raw {rawCount} / unique {uniqueCount}</p>
          <p>
            分发：<span style={{ color: statusColor }}>{publishStatus}</span>
          </p>
          {error && <p style={{ color: "#f97066" }}>错误：{error}</p>}

          <div style={{ display: "grid", gap: 8 }}>
            <button onClick={runAll} disabled={loading}>{loading ? "执行中..." : "全流程生成"}</button>
            <button onClick={() => runCollect()} disabled={loading}>仅采集</button>
            <button onClick={() => runAnalyze()} disabled={loading}>仅分析</button>
            <button onClick={() => runDigest()} disabled={loading}>仅生成日报</button>
            <button onClick={() => runPublish()} disabled={loading}>仅分发</button>
          </div>
        </section>
      </div>

      <section style={{ marginTop: 14, border: "1px solid #2b3448", borderRadius: 12, padding: 14, background: "#121a2d" }}>
        <h2 style={{ marginTop: 0 }}>历史日报</h2>
        <ul>
          {digests.length === 0 && <li>暂无历史</li>}
          {digests.map((d) => (
            <li key={d.id} style={{ marginBottom: 10 }}>
              <strong>{d.title}</strong>
              <div style={{ color: "#98a2b3" }}>{new Date(d.createdAt).toLocaleString("zh-CN")}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
