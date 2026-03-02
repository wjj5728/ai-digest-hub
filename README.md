# ai-digest-hub

AI 资讯聚合 -> 分析 -> 日报 -> 多渠道分发。

## v0.5.0
- 新增文件存储层（`data/daily-digests.json`）用于保存日报历史
- `/api/digest` 与 `/api/cron/daily` 生成后自动落盘
- 新增 `/api/digest/list` 查询最近日报

## v0.4.0
- Telegram 分发改为真实发送（配置 token/chat_id 后可直发）
- 未配置时自动 mock，不中断主流程
- `/api/publish` 与 `/api/cron/daily` 返回发送状态明细

## v0.3.0
- 新增分析打分层（`lib/pipeline/score.ts`）
- `/api/analyze` 输出 Top5 + 趋势一句话
- `/api/digest` 与 `/api/cron/daily` 接入真实分析链路
- 日报内容由采集结果实时生成，不再是固定占位文案

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
