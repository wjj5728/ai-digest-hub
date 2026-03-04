"use client";

import { useEffect, useMemo, useState } from "react";

type Topic = { tag: string; count: number };
type Item = {
  title: string;
  titleZh?: string;
  sourceName: string;
  score: number;
  url: string;
  dateLabel?: string;
  tier?: "A" | "B" | "C" | "D";
  confidence?: number;
};
type DigestRow = { id: string; createdAt: number; title: string; body: string };
type MetricRow = { date: string; total: number; aCount: number; bCount: number; cCount: number; dCount: number };
type SourceRow = { id: string; name: string; type: "rss" | "web" | "api"; enabled: boolean; weight?: number };
type ScheduleConfig = { timezone: string; hour: number; minute: number; autoPublish: boolean; topN: number };
type RunLog = { ts: number; stage: string; ok: boolean; detail: string };

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

function badge(value: string) {
  const base = {
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    border: "1px solid #2a3555",
    display: "inline-block",
    fontWeight: 700,
  } as const;
  if (value === "sent") return { ...base, color: "#22c55e", borderColor: "#1f7a43", background: "#0f2b1b" };
  if (value === "mocked") return { ...base, color: "#f59e0b", borderColor: "#7a4e11", background: "#2b1f0f" };
  if (value === "failed") return { ...base, color: "#f97373", borderColor: "#7f1d1d", background: "#2a1414" };
  return { ...base, color: "#94a3b8", background: "#111a2d" };
}

function tierColor(t?: string) {
  if (t === "A") return "#22c55e";
  if (t === "B") return "#34d399";
  if (t === "C") return "#f59e0b";
  if (t === "D") return "#f97373";
  return "#94a3b8";
}

const panel = {
  border: "1px solid #24304a",
  borderRadius: 14,
  background: "linear-gradient(180deg, #121a2d 0%, #0f1627 100%)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
} as const;

const actionButton = {
  borderRadius: 10,
  border: "1px solid #2a3555",
  background: "#16213a",
  color: "#e6edff",
  padding: "10px 12px",
  cursor: "pointer",
  fontWeight: 700,
} as const;

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("idle");
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [rawCount, setRawCount] = useState(0);
  const [uniqueCount, setUniqueCount] = useState(0);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [top, setTop] = useState<Item[]>([]);
  const [trend, setTrend] = useState("");
  const [publishStatus, setPublishStatus] = useState("-");
  const [digests, setDigests] = useState<DigestRow[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<DigestRow | null>(null);
  const [configStatus, setConfigStatus] = useState<{ hasApiKey?: boolean; mode?: string; baseUrl?: string; model?: string }>({});
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [topN, setTopN] = useState(20);
  const [audienceMode, setAudienceMode] = useState<"boss" | "tech" | "invest">("boss");
  const [minConfidence, setMinConfidence] = useState(0);
  const [tierFilter, setTierFilter] = useState("ALL");
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [schedule, setSchedule] = useState<ScheduleConfig>({ timezone: "Asia/Shanghai", hour: 8, minute: 30, autoPublish: true, topN: 20 });
  const [runLogs, setRunLogs] = useState<RunLog[]>([]);
  const [copied, setCopied] = useState(false);

  async function loadDigestHistory() {
    const data = await requestJson("/api/digest/list?limit=10");
    setDigests(data.rows || []);
  }

  async function loadMetrics() {
    const data = await requestJson("/api/metrics?limit=7");
    setMetrics(data.rows || []);
  }

  async function openDigestDetail(id: string) {
    const data = await requestJson(`/api/digest/${id}`);
    setSelectedDigest(data.row || null);
  }

  async function loadSources() {
    const data = await requestJson("/api/sources");
    setSources(data.rows || []);
  }

  async function toggleSource(id: string, enabled: boolean) {
    await requestJson("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled }),
    });
    await loadSources();
  }

  async function checkConfig() {
    const data = await requestJson("/api/config-check");
    setConfigStatus({ hasApiKey: data.hasApiKey, mode: data.mode, baseUrl: data.baseUrl, model: data.model });
  }

  async function loadSchedule() {
    const data = await requestJson("/api/schedule");
    if (data?.config) setSchedule(data.config);
  }

  async function loadRunLogs() {
    const data = await requestJson("/api/runlogs?limit=6");
    setRunLogs(data.rows || []);
  }

  async function saveSchedule() {
    const data = await requestJson("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    if (data?.config) setSchedule(data.config);
  }

  async function runCollect() {
    setStage("collect");
    const data = await requestJson("/api/collect", { method: "POST" });
    setRawCount(data.rawCount || 0);
    setUniqueCount(data.uniqueCount || 0);
  }

  async function runAnalyze() {
    setStage("analyze");
    const data = await requestJson("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topN }),
    });
    setRawCount(data.rawCount || 0);
    setUniqueCount(data.uniqueCount || 0);
    setTopics(data.topics || []);
    setTop(data.digest?.top || []);
    setTrend(data.digest?.trend || "");
  }

  async function runDigest() {
    setStage("digest");
    const data = await requestJson("/api/digest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topN, mode: audienceMode }),
    });
    setTopics(data.topics || []);
    setTop(data.digest?.top || []);
    setTrend(data.digest?.trend || "");
    await loadDigestHistory();
    await loadMetrics();
  }

  async function runPublish() {
    setStage("publish");
    const data = await requestJson("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topN, mode: audienceMode }),
    });
    setPublishStatus(data.results?.[0]?.status || "-");
  }

  async function runDigestAndOpenLatest() {
    await runDigest();
    const latest = await requestJson("/api/digest/list?limit=1");
    if (latest.rows?.[0]?.id) await openDigestDetail(latest.rows[0].id);
  }

  async function copyDigestBody() {
    if (!selectedDigest?.body) return;
    await navigator.clipboard.writeText(selectedDigest.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function exportDigestMarkdown() {
    if (!selectedDigest?.body) return;
    const blob = new Blob([selectedDigest.body], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-digest-${selectedDigest.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
    loadMetrics().catch(() => undefined);
    loadSources().catch(() => undefined);
    loadSchedule().catch(() => undefined);
    loadRunLogs().catch(() => undefined);
    const q = window.matchMedia("(max-width: 920px)");
    const update = () => setIsMobile(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);

  const visibleTop = useMemo(() => {
    return top.filter((x) => {
      const passTier = tierFilter === "ALL" || x.tier === tierFilter;
      const passConfidence = (x.confidence || 0) >= minConfidence;
      return passTier && passConfidence;
    });
  }, [top, tierFilter, minConfidence]);

  const aTierCount = useMemo(() => top.filter((x) => x.tier === "A").length, [top]);
  const aTierRate = top.length ? `${Math.round((aTierCount / top.length) * 100)}%` : "-";

  return (
    <main
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: 20,
        color: "#e6edff",
        background:
          "radial-gradient(circle at 20% -10%, rgba(52,211,153,0.15), transparent 45%), radial-gradient(circle at 100% 0%, rgba(96,165,250,0.12), transparent 35%), #0a1120",
      }}
    >
      <h1 style={{ marginBottom: 8, letterSpacing: 0.2 }}>AI Digest Hub</h1>
      <p style={{ marginTop: 0, color: "#8fa2c7" }}>v1.3.1 日报模板模式：老板版 / 技术版 / 投资版</p>

      <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
        <div style={{ ...panel, padding: 12 }}><div style={{ color: "#8fa2c7", fontSize: 12 }}>采集条数</div><div style={{ fontSize: 24, fontWeight: 800 }}>{rawCount}</div></div>
        <div style={{ ...panel, padding: 12 }}><div style={{ color: "#8fa2c7", fontSize: 12 }}>去重后</div><div style={{ fontSize: 24, fontWeight: 800 }}>{uniqueCount}</div></div>
        <div style={{ ...panel, padding: 12 }}><div style={{ color: "#8fa2c7", fontSize: 12 }}>A级占比</div><div style={{ fontSize: 24, fontWeight: 800 }}>{aTierRate}</div></div>
        <div style={{ ...panel, padding: 12 }}><div style={{ color: "#8fa2c7", fontSize: 12 }}>分发状态</div><div style={{ marginTop: 8 }}><span style={badge(publishStatus)}>{publishStatus}</span></div></div>
      </section>

      <section style={{ ...panel, padding: 14, marginBottom: 12 }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>近7天趋势</h2>
        <div style={{ display: "grid", gap: 8 }}>
          {metrics.length === 0 && <div style={{ color: "#8fa2c7" }}>暂无趋势数据，先生成日报后显示。</div>}
          {metrics.map((m) => (
            <div key={m.date} style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ color: "#8fa2c7", fontSize: 12 }}>{m.date}</div>
              <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", background: "#1d2740" }}>
                <div style={{ width: `${Math.min(100, m.aCount * 10)}%`, background: "#22c55e" }} />
                <div style={{ width: `${Math.min(100, m.bCount * 10)}%`, background: "#34d399" }} />
                <div style={{ width: `${Math.min(100, m.cCount * 10)}%`, background: "#f59e0b" }} />
                <div style={{ width: `${Math.min(100, m.dCount * 10)}%`, background: "#f97373" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 14 }}>
        <section style={{ ...panel, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>今日 Top{topN}</h2>
          <p style={{ color: "#8fa2c7" }}>趋势：{trend || "点击全流程生成后显示"}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ color: "#8fa2c7", fontSize: 12 }}>筛选：</span>
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} style={{ borderRadius: 8, background: "#16213a", color: "#e6edff", border: "1px solid #2a3555", padding: "2px 8px" }}>
              <option value="ALL">全部等级</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
            <select value={minConfidence} onChange={(e) => setMinConfidence(Number(e.target.value))} style={{ borderRadius: 8, background: "#16213a", color: "#e6edff", border: "1px solid #2a3555", padding: "2px 8px" }}>
              <option value={0}>置信度不限</option>
              <option value={60}>{">= 60"}</option>
              <option value={70}>{">= 70"}</option>
              <option value={80}>{">= 80"}</option>
            </select>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {visibleTop.length === 0 && <div style={{ color: "#8fa2c7" }}>暂无匹配数据</div>}
            {visibleTop.map((x, i) => (
              <article key={i} style={{ border: "1px solid #2a3555", borderRadius: 12, padding: 12, background: "#0f172b" }}>
                <div style={{ fontWeight: 800, lineHeight: 1.5 }}>{x.titleZh || x.title}</div>
                <div style={{ color: "#8fa2c7", marginTop: 4, fontSize: 13 }}>
                  {x.sourceName} | 日期 {x.dateLabel || "未知"} | 评分 {x.score} | 信源 <span style={{ color: tierColor(x.tier), fontWeight: 700 }}>{x.tier || "-"}</span> | 置信度 {x.confidence ?? "-"}
                </div>
                <a href={x.url} target="_blank" rel="noreferrer" style={{ color: "#7dd3fc", fontSize: 13 }}>原始链接</a>
              </article>
            ))}
          </div>
          <h3>主题统计</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {topics.length === 0 && <span style={{ color: "#8fa2c7" }}>暂无</span>}
            {topics.map((t) => <span key={t.tag} style={{ border: "1px solid #2a3555", borderRadius: 999, padding: "4px 10px", background: "#111a30" }}>{t.tag}: {t.count}</span>)}
          </div>
        </section>

        <section style={{ ...panel, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>控制台</h2>
          <p>阶段：{stage}</p>
          <p>
            Top条数：
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              style={{ marginLeft: 8, borderRadius: 8, background: "#16213a", color: "#e6edff", border: "1px solid #2a3555", padding: "3px 8px" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </p>
          <p>
            模板模式：
            <select
              value={audienceMode}
              onChange={(e) => setAudienceMode(e.target.value as "boss" | "tech" | "invest")}
              style={{ marginLeft: 8, borderRadius: 8, background: "#16213a", color: "#e6edff", border: "1px solid #2a3555", padding: "3px 8px" }}
            >
              <option value="boss">老板版</option>
              <option value="tech">技术版</option>
              <option value="invest">投资版</option>
            </select>
          </p>
          <p>模式：{configStatus.mode || "未检测"}</p>
          <p>模型：{configStatus.model || "-"}</p>
          {error && <p style={{ color: "#f97373" }}>错误：{error}</p>}
          <div style={{ display: "grid", gap: 8 }}>
            <button style={actionButton} onClick={runAll} disabled={loading}>{loading ? "执行中..." : "全流程生成"}</button>
            <button style={actionButton} onClick={runDigestAndOpenLatest} disabled={loading}>生成并打开最新日报</button>
            <button style={actionButton} onClick={checkConfig} disabled={loading}>检测模型配置</button>
            <button style={actionButton} onClick={runCollect} disabled={loading}>仅采集</button>
            <button style={actionButton} onClick={runAnalyze} disabled={loading}>仅分析</button>
            <button style={actionButton} onClick={runDigest} disabled={loading}>仅生成日报</button>
            <button style={actionButton} onClick={runPublish} disabled={loading}>仅分发</button>
          </div>

          <h3 style={{ marginTop: 14, marginBottom: 8 }}>渠道管理</h3>
          <div style={{ display: "grid", gap: 6, maxHeight: 180, overflow: "auto", border: "1px solid #2a3555", borderRadius: 10, padding: 8 }}>
            {sources.map((s) => (
              <label key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span>{s.name} <span style={{ color: "#8fa2c7" }}>({s.type})</span></span>
                <input
                  type="checkbox"
                  checked={s.enabled}
                  onChange={(e) => toggleSource(s.id, e.target.checked)}
                />
              </label>
            ))}
          </div>

          <h3 style={{ marginTop: 14, marginBottom: 8 }}>定时配置</h3>
          <div style={{ border: "1px solid #2a3555", borderRadius: 10, padding: 8, display: "grid", gap: 8, fontSize: 12 }}>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "#8fa2c7" }}>时区</span>
              <input value={schedule.timezone} onChange={(e) => setSchedule((p) => ({ ...p, timezone: e.target.value }))} style={{ borderRadius: 8, background: "#16213a", color: "#e6edff", border: "1px solid #2a3555", padding: "6px 8px" }} />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ color: "#8fa2c7" }}>小时</span>
                <input type="number" min={0} max={23} value={schedule.hour} onChange={(e) => setSchedule((p) => ({ ...p, hour: Number(e.target.value) }))} style={{ borderRadius: 8, background: "#16213a", color: "#e6edff", border: "1px solid #2a3555", padding: "6px 8px" }} />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ color: "#8fa2c7" }}>分钟</span>
                <input type="number" min={0} max={59} value={schedule.minute} onChange={(e) => setSchedule((p) => ({ ...p, minute: Number(e.target.value) }))} style={{ borderRadius: 8, background: "#16213a", color: "#e6edff", border: "1px solid #2a3555", padding: "6px 8px" }} />
              </label>
            </div>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#8fa2c7" }}>自动分发</span>
              <input type="checkbox" checked={schedule.autoPublish} onChange={(e) => setSchedule((p) => ({ ...p, autoPublish: e.target.checked }))} />
            </label>
            <label style={{ display: "grid", gap: 4 }}>
              <span style={{ color: "#8fa2c7" }}>定时Top条数</span>
              <input type="number" min={1} max={50} value={schedule.topN} onChange={(e) => setSchedule((p) => ({ ...p, topN: Number(e.target.value) }))} style={{ borderRadius: 8, background: "#16213a", color: "#e6edff", border: "1px solid #2a3555", padding: "6px 8px" }} />
            </label>
            <button style={actionButton} onClick={saveSchedule}>保存定时配置</button>
          </div>

          <h3 style={{ marginTop: 14, marginBottom: 8 }}>最近运行日志</h3>
          <div style={{ display: "grid", gap: 6, maxHeight: 140, overflow: "auto", border: "1px solid #2a3555", borderRadius: 10, padding: 8, fontSize: 12 }}>
            {runLogs.length === 0 && <span style={{ color: "#8fa2c7" }}>暂无日志</span>}
            {runLogs.map((l, idx) => (
              <div key={idx} style={{ color: l.ok ? "#34d399" : "#f97373" }}>
                {new Date(l.ts).toLocaleString("zh-CN")} [{l.stage}] {l.detail}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginTop: 14 }}>
        <section style={{ ...panel, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>历史日报</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ color: "#8fa2c7", textAlign: "left" }}><th style={{ paddingBottom: 8 }}>时间</th><th style={{ paddingBottom: 8 }}>标题</th></tr>
            </thead>
            <tbody>
              {digests.length === 0 && <tr><td colSpan={2} style={{ color: "#8fa2c7" }}>暂无历史</td></tr>}
              {digests.map((d) => (
                <tr key={d.id}>
                  <td style={{ padding: "6px 0", color: "#8fa2c7" }}>{new Date(d.createdAt).toLocaleString("zh-CN")}</td>
                  <td style={{ padding: "6px 0" }}>
                    <button
                      style={{ background: "transparent", border: 0, color: "#e6edff", cursor: "pointer", padding: 0, textAlign: "left", fontWeight: 700 }}
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

        <section style={{ ...panel, padding: 14 }}>
          <h2 style={{ marginTop: 0 }}>日报正文</h2>
          {!selectedDigest && <p style={{ color: "#8fa2c7" }}>点击左侧历史日报查看正文。</p>}
          {selectedDigest && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <button style={actionButton} onClick={copyDigestBody}>复制正文</button>
                <button style={actionButton} onClick={exportDigestMarkdown}>导出 Markdown</button>
                {copied && <span style={{ color: "#22c55e", fontSize: 12, alignSelf: "center" }}>已复制</span>}
              </div>
              <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: 13, color: "#dbe6ff" }}>{selectedDigest.body}</pre>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
