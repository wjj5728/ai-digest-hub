export const metadata = {
  title: "AI Digest Hub",
  description: "AI资讯日报聚合与分发",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, fontFamily: "-apple-system, Segoe UI, sans-serif", background: "#0b1020", color: "#e8eefc" }}>
        {children}
      </body>
    </html>
  );
}
