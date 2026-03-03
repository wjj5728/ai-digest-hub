# ai-digest-hub

AI 资讯聚合 -> 分析 -> 日报 -> 多渠道分发。

## v1.1.2
- Top 列表新增前端筛选：信源等级（A/B/C/D）与最小置信度
- Top 卡片新增日期展示，便于快速判断时效
- 支持“20条基础上再过滤”，提升浏览效率

## v1.1.1
- Top 默认条数从 5 提升到 20
- 新增 Top 条数选择（5/10/20/30），并贯穿分析/生成/分发链路
- 支持按需切换数据展示规模

## v1.1.0
- 新增渠道管理接口：`/api/sources`（查询/更新来源开关）
- 控制台新增“渠道管理”区，可直接开启/关闭指定资讯源
- 采集链路统一改为读取动态来源配置（rss/web/api）

## v1.0.9
- 视觉重构为“情报中台”风格（渐变背景 + 强层级卡片）
- 统一按钮、状态标签、信源等级颜色体系
- 强化信息扫描效率（KPI/趋势/Top5/控制台/历史分区）

## v1.0.8
- 移动端体验优化：核心布局自适应单列
- 控制台与历史区在小屏下按阅读顺序重排
- 表格与操作按钮优化触控间距

## v1.0.7
- 新增轻量趋势图：近7天日报总量与A/B/C/D分布
- 新增 `daily-metrics` 存储，生成日报时自动写入指标
- 首页显示趋势可视化（无需额外图表库）

## v1.0.6
- 新增“复制日报正文”与“导出Markdown”操作
- 控制台新增“一键生成并打开最新日报”快捷动作
- 强化日报复用效率（分发前快速人工校对）

## v1.0.5
- 首页 UI 产品化改造：KPI 卡片 + Top5 卡片流 + 控制台
- 历史日报改为表格列表，详情预览联动保留
- 分发状态与信源等级采用统一视觉标识

## v1.0.4
- 新增信源分级与置信度（A/B/C/D + confidence）
- Top5 每条资讯显示来源等级与可信度
- 为后续“仅输出高可信资讯”打基础

## v1.0.3
- 日报改为“今日优先”：仅收录 Asia/Shanghai 当日发布资讯
- 今日不足 5 条时不补历史，确保时效性
- 扩大 RSS 覆盖源（OpenAI Blog / DeepMind / Meta AI / Cohere / Microsoft Research AI）

## v1.0.2
- 页面新增“运行模式”展示：`ai` 或 `mocked`
- `/api/config-check` 返回 `mode` 字段，便于直观看当前链路

## v1.0.1
- 新增模型配置自检接口：`/api/config-check`
- 首页增加“一键检测模型配置”按钮
- 前端可直接查看 key/baseUrl/model 生效状态

## v1.0.0
- 新增多源采集聚合：RSS + 网页抓取 + 公共API
- 新增 `collector/web.ts`（OpenAI Index、Mistral News）
- 新增 `collector/api.ts`（Hacker News Top、GitHub Releases）
- 所有分析/生成/分发链路统一走 `collectAllSources`

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
