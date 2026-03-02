export default function HomePage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>AI Digest Hub</h1>
      <p>v0.1.0 脚手架已就绪：collect {"->"} analyze {"->"} digest {"->"} publish。</p>
      <ul>
        <li>/api/health</li>
        <li>/api/collect</li>
        <li>/api/analyze</li>
        <li>/api/digest</li>
        <li>/api/publish</li>
        <li>/api/cron/daily</li>
      </ul>
    </main>
  );
}
