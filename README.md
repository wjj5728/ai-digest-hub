# ai-digest-hub

AI 资讯聚合 -> 分析 -> 日报 -> 多渠道分发。

## v0.1.0
- 项目脚手架初始化（Next.js App Router）
- API 路由：`/api/collect` `/api/analyze` `/api/digest` `/api/publish` `/api/cron/daily` `/api/health`
- 模块目录：collector / pipeline / analyst / publisher / db / config
- `cron/daily` 已串联主流程（MVP 占位实现）

## 运行
```bash
pnpm install
pnpm dev
```

## 环境变量
参考 `.env.example`。
