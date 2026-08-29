# 契约 v1.3 与现状差距审计报告（t1 / auditor）

- 审计人：auditor（团队 portal-anon-access）
- 日期：2026-08-28
- 契约事实来源：任务提示词 §一（repo 内无 `docs/handoff/ai-hub-portal-api.md`，未假定存在；本报告契约要点取自团队任务上下文：端点分级 / 匿名语义 / 401 可选认证 / actor 探测 / 缓存头 / 限流 / 约束）
- 审计对象：当前工作区实现（含上一轮未提交改动，`git status` 可见：common.ts/session.ts/guards.tsx/LoginDialog/auth.ts/common.ts/PortalHeader/ResourceDetailView/AppsHuntPage 等）

---

## 0. 契约要点（审计依据）

1. 门户不强制登录：home / 四类列表 / 详情 / 评论 GET / 部门 / 技能包 / apps-hunt / docs 全部匿名可读（200 正常渲染）。
2. 可选认证语义（P1-5）：公开读端点携带**无效会话**时返回 401；前端应「清除本地登录态缓存 → 以匿名身份重试一次 → 成功后正常渲染」；仍失败才走错误提示；**不弹登录弹窗、不跳转、不死循环**。
3. 写端点（favorite / comments POST / apps-hunt/votes / dashboard / publish/*）与 dashboard 读端点的 401：打开全局登录弹窗（含 returnTo），登录后回原页并继续原动作。
4. actor 探测：`GET /internal/identity/actor` 在**应用启动时**与**401 恢复时**调用并缓存结果（200=已登录 / 401=未登录），不使用 `document.cookie` 判断登录态。
5. 约束：不写 localStorage；不改 URL/方法/响应字段语义；不强制覆盖读响应缓存头；保持 `credentials: "same-origin"` 与 CSRF 头逻辑；不引入低于 60s 间隔的轮询（匿名限流 60s/120 次）。
6. 产品决策（AGENTS.md）：登录不设独立页面，统一全局登录弹窗（`LoginDialog.tsx` + `store/auth.ts`）；「引导登录」= 打开弹窗并携带 returnTo。

---

## 1. 验收清单 7 项逐项核对

（任务提示词 §四共 7 项，按团队上下文重构如下；若与原文编号有出入，以内容为准。）

### 1.1 无 Cookie 匿名浏览：公开读端点全部 200 且正常渲染 — 【通过】

证据：
- 路由层：`src/router/index.tsx:25-26` —— 门户浏览路由（`/`、apps/skills/source/docs 全部子路由）挂在 `PortalLayout` 下，**不经过 AuthGuard**；AuthGuard 只包 `dashboardRoutes`（个人中心）。
- 页面错误态均为 `ErrorState`（可重试），无登录引导：`src/pages/home/HomePage.tsx:25-30`、`src/pages/apps/AppsPage.tsx:17-18`、`src/pages/docs/ContentPageView.tsx:16`、四个详情页（AppDetailPage.tsx:10 等）。
- 全部读端点经单一 `apiFetch`（`src/apis/common.ts:62-83`），GET 无任何登录前置。
- 匿名时 `/internal/identity/actor` 返回 401 属合法状态：`getCurrentActor` 显式传 `announceUnauthorized: false`（`src/apis/common.ts:96`），不弹窗。
- 佐证：`tests/portal.test.tsx:610-652` 未登录场景正常渲染；`tests/e2e/portal.spec.ts:3-35` 全路由可达（fixtures 模式）。

### 1.2 匿名个性化字段降级（isFavorited=false / hasVoted=false），收藏/评论/投票入口引导登录不报错 — 【通过】

证据：
- `mapPortalResource` 原样消费 `item.isFavorited → isStarred`（`src/apis/common.ts:141`）；匿名时服务端返回 false/缺省 → 页面按 false 渲染「收藏」而非「已收藏」，不伪造。
- `getAppsHunt` 原样消费 `row.hasVoted`（`src/apis/apps.ts:42`）；匿名缺省为 false。
- 入口引导统一走 `useRequireLogin`（`src/hooks/auth.ts:31-41`）：`actor.data` 为空 → `openLoginDialog({ onSuccess })` 并暂缓动作，不抛错。
  - 收藏/打开/评论：`src/components/common/ResourceDetailView.tsx:43,75,108`
  - 投票：`src/pages/apps/AppsHuntPage.tsx:38`
  - 发布/个人中心：`src/components/common/PortalHeader.tsx:128,146,185`

### 1.3 无 Cookie 写端点 401 → 登录弹窗 + returnTo，登录后继续原动作 — 【通过（但依赖全局 401 分类，见 1.5）】

证据：
- 写端点 401 → `apiFetch` 派发 `portal:unauthorized`（`src/apis/common.ts:78`）→ `main.tsx:14` 监听 → `handleUnauthorized`（`src/apis/session.ts:15-18`）：移除 actor 查询 + `openLoginDialog({ returnTo: currentReturnTo() })`。
- 登录成功继续原动作：`useLoginMutation.onSuccess` 清上一会话 dashboard 缓存并写 actor 缓存（`src/hooks/auth.ts:17-23`）；`LoginDialog.finishLogin` 先执行 `onSuccess`（补发被拦截的收藏/评论/投票）再 `navigate(returnTo)`（`src/components/auth/LoginDialog.tsx:61-66`）。
- 弹窗只清理 actor 查询、不全局清缓存，避免「401 → 清空 → 重取 → 401」循环（`src/apis/session.ts:10-14` 注释）。
- 测试：`tests/portal.test.tsx:584-608`（401 派发事件 + handleUnauthorized 弹窗）。

### 1.4 登录后个性化数据与写操作可用（与改造前一致）— 【通过】

证据：
- 登录态唯一来源是 actor 查询（`src/hooks/common.ts:13-15`），登录成功后 `setQueryData` 立即生效；Header 显示退出登录（`src/components/common/PortalHeader.tsx:211-258`），Dashboard 经 AuthGuard 放行（`src/router/guards.tsx:28-30`）。
- 收藏/评论/投票写操作路径与改造前一致（同一 URL/方法/字段，见 1.5 约束项）。

### 1.5 会话过期访问公开读端点 401 → 清登录态 + 匿名重试一次（P1-5）— 【缺失】★ 核心差距

现状（问题确认）：
- `apiFetch` 对**任何** 401（除 `announceUnauthorized: false`）派发 `UNAUTHORIZED_EVENT`（`src/apis/common.ts:78`）；`main.tsx:14` → `handleUnauthorized` → **打开登录弹窗**（`src/apis/session.ts:17`）。
- 公开读端点（home/四类列表/详情/评论 GET/部门/技能包/apps-hunt/docs）全部走默认 `apiFetch`（如 `src/apis/common.ts:172,224`、`src/apis/apps.ts:12,18,25,55,67`、`src/apis/skills.ts:28,34,41,46`、`src/apis/source.ts:20,26,33,39`、`src/apis/docs.ts:7`）——因此**无效会话 401 会错误弹出登录弹窗**，且：
  1. ❌ 没有「匿名重试一次」逻辑。React Query 默认 `retry: 1`（`src/main.tsx:10`）只是原样重发（仍携带同一无效 cookie、仍会再 401），语义不是「清登录态后的匿名重试」。
  2. ❌ 清登录态不完整：`handleUnauthorized` 只移除 actor 查询（`src/apis/session.ts:16`），失败的数据查询不失效重取，页面停在 `ErrorState`（需用户手动点重试）。
  3. ❌ 公开读与写端点的 401 行为没有分类机制（`announceUnauthorized` 只有全开/全关两档）。
- 死循环风险：当前实现不会死循环（retry 有界、handleUnauthorized 不触发新请求），但「每次 401 弹窗」是确定的错误体验。

修复建议（供 t2 工程师）：
- 给公开读请求增加「可选认证」标记（例如在 apiFetch options 增加 `allowAnonymousRetry`，或新增公开读专用封装），401 时：
  1. 移除 actor 查询（清登录态，UI 立即回到未登录视图）；
  2. 重新发起同一次 GET（匿名语义：仅重放请求本身，cookie 由浏览器按 same-origin 自动携带）**且只重试一次**；
  3. 第二次仍 401 → 走 ErrorState（页面已有 `retry` 能力）；**不派发 `UNAUTHORIZED_EVENT`、不弹窗、不跳转**。
- 与 React Query 的 `retry:1` 协调：公开读查询建议设 `retry: false`，由上述单次匿名重试逻辑负责，避免「RQ 重试 + 匿名重试」叠加成 3 次请求（限流敏感）。
- 写端点与 dashboard 读端点保持现有弹窗逻辑不变（1.3）。
- 同步更新测试：`tests/portal.test.tsx:584-594`（当前锁定「apiFetch 401 必派发事件」）与 `:601-608` 需按端点分级调整，并新增 P1-5 用例（t3 落实）。

### 1.6 actor 探测：启动时 + 401 恢复时各一次，不用 document.cookie — 【部分实现】

证据：
- 启动时 ✔：`PortalHeader`（`src/components/common/PortalHeader.tsx:211`）与 `AuthGuard`（`src/router/guards.tsx:17`）挂载即消费 `useCurrentActor`（`src/hooks/common.ts:13-15`，`retry: false`）→ 应用启动即探测一次；Header 对 `actor.isPending` 不渲染登录区（`PortalHeader.tsx:229`），不阻塞页面。
- 401 恢复时 ✘：`handleUnauthorized` 仅 `removeQueries(actor)`（`src/apis/session.ts:16`），依赖组件重渲染时 useQuery observer 自动重取 —— 属隐式行为，非契约要求的「401 恢复时显式探测」；且 P1-5 匿名重试路径中没有任何 actor 重探测（因为根本没走通重试）。
- 不使用 document.cookie 判断登录态 ✔：登录态唯一来源为 actor 查询；`src/apis/common.ts:21-28` 读 cookie 仅用于写请求 CSRF 头，非登录态判断。

修复建议：P1-5 匿名重试路径中，清 actor 缓存后**主动触发一次 actor 探测**（或锁定测试证明 401 恢复后 actor 被再次调用）；写端点 401 路径保持现状（removeQueries 后 observer 重取 + 登录成功 setQueryData）。

### 1.7 约束合规：无 localStorage / 无缓存头覆盖 / 无 URL·方法·字段语义改动 / same-origin + CSRF / 限流友好 — 【通过】（P1-5 实现时需守住）

证据（全 src 检索）：
- 无 localStorage/sessionStorage 写入：`grep localStorage|sessionStorage` 仅命中 `src/apis/API-INTEGRATION-REPORT.md` 文档描述，代码零写入。
- 不强制覆盖读响应缓存头：`grep Cache-Control|cache-control` 全 src 无任何设置（`apiFetch` 也不触碰 response headers）。
- URL/方法/字段语义未改：本轮改动未触碰任何端点路径/方法/请求体结构（对照 `src/apis/API-INTEGRATION-REPORT.md` 接口清单，全部沿用）。
- `credentials: "same-origin"`（`src/apis/common.ts:74`）；写方法带 `x-csrf-token` / `x-request-nonce` / `x-request-timestamp`（`src/apis/common.ts:68-73`）。
- 限流友好 ✔：全 src 无 `refetchInterval` / `setInterval` / 轮询；`main.tsx:10` 仅 `retry: 1, staleTime: 30s`（有界）；`refetchOnWindowFocus` 为 React Query 默认（用户驱动，非轮询）。注意：P1-5 匿名重试**只允许一次**，不得做成退避/循环重试。

---

## 2. 重点核查 5 项结论

| # | 核查项 | 结论 | 证据 |
| --- | --- | --- | --- |
| ① | 公开读端点 401（无效会话）是否只弹登录弹窗而未做「清登录态+匿名重试一次」 | **是（P1-5 差距确认）** | common.ts:78 全局派发事件 → session.ts:17 弹窗；无匿名重试逻辑 |
| ② | actor 探测是否在启动与 401 恢复时调用 | 启动 ✔ / 401 恢复 ✘（隐式、无显式重探测） | common.ts:13-15, PortalHeader.tsx:211；session.ts:16 仅 removeQueries |
| ③ | 前端是否强制覆盖读响应缓存头 | 否（合规） | 全 src 无 Cache-Control 操作 |
| ④ | 是否存在违反匿名限流（60s/120 次）的轮询/重试配置 | 否（当前合规；注意 P1-5 重试只能一次） | 无 refetchInterval/setInterval；retry:1 有界 |
| ⑤ | 登录引导是否统一走弹窗（勿恢复独立登录页） | 是（合规） | router/index.tsx:21 `/login` 重定向；AuthGuard + useRequireLogin + LoginDialog 全覆盖；`LoginPage.tsx` 已删除 |

---

## 3. 其余发现（低优先级，供工程师参考）

- **P2**「打开应用/查看安装」按钮在已登录时无实际动作：`src/components/common/ResourceDetailView.tsx:75` `onClick={() => requireLogin()}` 无 `onSuccess`——登录引导（弹窗）已实现，但「登录后继续打开应用」动作未定义。建议 t2 顺带补 `requireLogin(() => 打开应用/导航)` 或明确维持现状并记录。
- **P3** `getLoginOptions` / `getLoginChallenge`（`src/apis/auth.ts:17,21`）为身份类公开读端点，未传 `announceUnauthorized: false`；若 401 会派发事件再次打开弹窗（登录弹窗已打开时无实害）。建议加标记。
- **P3** 测试缺口：现有 401 测试（`tests/portal.test.tsx:584-608`）锁定的是「任意 401 → 弹窗」旧行为，P1-5 实现后必须同步改写；t3 需补「公开读 401 → 匿名重试一次」「写端点 401 → 弹窗」「actor 探测时机」用例。

---

## 4. 结论

- 现状已满足：匿名可浏览（1.1）、个性化字段匿名降级（1.2）、写端点 401 弹窗+returnTo+继续动作（1.3）、登录后个性化（1.4）、约束合规（1.7）、登录引导统一弹窗（核查⑤）。
- **唯一 P1 差距**：公开读端点 401 的「清登录态 + 匿名重试一次」未实现（1.5 / 核查①），且 401 分类机制缺失；actor 探测的「401 恢复时」为部分实现（1.6 / 核查②）。
- 修复不影响既有架构：保持 `apiFetch` 单一客户端 + React Query + 全局登录弹窗；不新增接口、不改 URL/方法/字段、不写 localStorage、不覆盖缓存头、不引入轮询。
