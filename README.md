# ai-digest-hub

AI 资讯聚合 -> 分析 -> 日报 -> 多渠道分发。

## v0.9.1
- 强化标题中文化兜底：模型失败或输出偏英文时，走本地术语映射翻译
- 修复“标题未翻译中文”问题，保证前端展示中文摘要

## v0.9.0
- 新增日报详情接口：`/api/digest/[id]`
- 首页历史列表支持点击查看“日报正文”
- 增加正文预览面板，便于校对与复制

## v0.8.2
- 修复 `/api/digest` 在 Vercel 环境写入失败导致的 500
- 文件存储在 Vercel 自动切换到 `/tmp/ai-digest-hub`
- 本地环境继续使用 `data/daily-digests.json`

## v0.8.1
- 前端 API 请求增加 JSON 容错解析
- 后端异常返回 HTML/空响应时，前端改为可读错误提示
- 修复 `Unexpected end of JSON input` 导致流程中断

## v0.8.0
- 采集标题增加中文化处理（优先模型翻译，失败自动兜底）
- 日报 Top5 输出中文要点 + 原始链接
- 前端 Top5 区域新增“原文链接”直达

## v0.7.0
- 首页升级为可操作控制台（全流程/单步按钮）
- 可视化展示：Top5、趋势、主题统计、分发状态
- 增加错误提示与执行阶段状态
- 历史日报列表与主流程联动刷新

## v0.6.0
- 分析层新增主题统计（model/product/policy/infra）
- `/api/analyze` 与 `/api/digest` 返回 `topics` 字段
- 首页增加“最近日报记录”预览

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
