# AI Hub Portal

AI Hub 员工门户前端，覆盖 App、Skill、Plugin、MCP、应用猎手、部门中心、技能包、文档与个人工作台。生产数据只通过同域 `/internal/portal/*` API 获取。

## 技术栈

- Vite + React + TypeScript
- React Router、TanStack Query、Zustand
- React Hook Form + Zod
- TailwindCSS 4
- Vitest、Testing Library、MSW、Playwright

## 本地开发

```bash
npm install
npm run dev
```

开发环境默认关闭 fixtures，`/internal/*` 请求通过 Vite 代理直连本地 AI Hub API（`http://127.0.0.1:3000`）。仅当本地无后端、需要完整预览时才启用 fixtures：

```bash
VITE_PORTAL_USE_FIXTURES=true npm run dev
```

生产静态数据与接口缺失时的回退数据统一在 `src/apis/static-data.ts` 管理；联调状态见 `src/apis/API-INTEGRATION-REPORT.md`。

## 质量门禁

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## 部署边界

- Portal：`/`、`/apps/*`、`/skills/*`、`/plugins/*`、`/mcp/*`、`/dashboard/*`
- Console：`/console/*`
- API：`/internal/*`

Portal Vite `base` 为 `/`。`index.html` 与路由回退使用 `no-cache`；带 Hash 的 `/assets/*` 使用一年 `immutable` 缓存。外层网关负责将 `/console/*` 转发到 Console，将 `/internal/*` 转发到 AI Hub API。

## 研究证据

复刻来源拓扑、行为、组件规格和三档截图位于 `docs/research` 与 `docs/design-references`。这些文件只用于设计校准，不参与生产运行时加载。
