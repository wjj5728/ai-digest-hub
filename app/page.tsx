import { listDigests } from "@/lib/db/file-store";

export default async function HomePage() {
  const rows = await listDigests(5);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>AI Digest Hub</h1>
      <p>v0.6.0：分析主题统计 + 最近日报记录预览。</p>
      <ul>
        <li>/api/health</li>
        <li>/api/collect</li>
        <li>/api/analyze</li>
        <li>/api/digest</li>
        <li>/api/publish</li>
        <li>/api/cron/daily</li>
      </ul>

      <h2>最近日报</h2>
      {rows.length === 0 ? (
        <p>暂无日报记录，先调用 /api/digest 或 /api/cron/daily 生成。</p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id}>
              <strong>{row.title}</strong>
              <div>{new Date(row.createdAt).toLocaleString("zh-CN")}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
