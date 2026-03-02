# ai-digest-hub

AI 资讯聚合 -> 分析 -> 日报 -> 多渠道分发。

## v0.2.0
- 接入真实 RSS 抓取（`fast-xml-parser`）
- `/api/collect` 增加去重统计（rawCount/uniqueCount）
- 返回采集错误明细（按 source）
- 采集结果限制返回前50条，便于后续分析链路接入

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
