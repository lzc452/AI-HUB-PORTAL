# Prototype Instructions

## AI Hub Portal 一期固定约束

- 默认使用简体中文；标识符、路由、配置键、技术专名保持英文。
- 本仓库只包含 Vite + React + TypeScript 门户前端；业务 API 固定为同域 `/internal/portal/*`。
- 目录采用技术层分层：`apis`、`store`、`router`、`types`、`hooks`、`utils`、`schemas` 中每个业务模块为一个文件；`pages`、`components` 按业务目录组织。
- `@/` 固定映射到 `src/`；禁止跨层使用深层 `../../../` 相对路径。
- App、Skill、Plugin、MCP 是四个独立资源类型；AppHunt 只包含 App，SkillPackage 只包含 Skill。
- Dashboard 导航包含个人中心、发布、设置、收藏、评论；不得恢复“我的关注”、实名认证或 API Key 页面。
- 生产构建不得读取 SkillHub 运行时数据或热链 SkillHub 资产。
- Portal 部署在 `/`，Console 部署在 `/console/`，API 部署在 `/internal/*`。

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
