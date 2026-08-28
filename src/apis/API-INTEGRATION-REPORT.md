# AI-HUB-PORTAL 接口联调报告

| 项目 | 内容 |
| --- | --- |
| 更新日期 | `2026-08-28` |
| 接口事实来源 | `AI-HUB-PLATFORM/docs/handoff/ai-hub-portal-api.md`（v1.1，后端 `packages/server/src/portal/*`、`identity.controller.ts` 已对照核实） |
| 前端运行模式 | `VITE_PORTAL_USE_FIXTURES` 默认关闭（`useFixtures = import.meta.env.DEV && VITE_PORTAL_USE_FIXTURES === "true"`）；默认直连同域 `/internal/portal/*`（dev 经 Vite 代理到 `http://127.0.0.1:3000`） |
| 认证 | `credentials: "same-origin"` + HttpOnly Cookie（`aihub_eid`/`aihub_sid`）；写请求带 `x-csrf-token`/`x-request-nonce`/`x-request-timestamp`；不写 localStorage |

## 1. 已接入接口清单

### 读取

| 路由 | 前端函数 | 状态 |
| --- | --- | --- |
| `GET /internal/portal/home` | `getHome`（common.ts） | ✅ 已适配（apps/skills/plugins/mcps/departments/skillPackages/updates 均显式映射） |
| `GET /internal/portal/apps` | `listApps`（apps.ts） | ✅ 已适配（`sortBy: updatedAt→latest / downloads→score`） |
| `GET /internal/portal/apps/:ownerEmployeeId/:slug` | `getApp`（apps.ts） | ✅ 已适配（详情扩展信息读 metadata，见 §3） |
| `GET /internal/portal/skills` / `/:owner/:slug` | `listSkills` / `getSkill`（skills.ts） | ✅ 已适配 |
| `GET /internal/portal/plugins` / `/:owner/:slug` | `listPlugins` / `getPlugin`（source.ts） | ✅ 已适配 |
| `GET /internal/portal/mcps` / `/:slug` | `listMcps` / `getMcp`（source.ts） | ✅ 已适配 |
| `GET /internal/portal/{type}/{id}/comments` | `listResourceComments`（common.ts） | ✅ 已适配（扁平 `PortalCommentItem[]` → 回复树） |
| `GET /internal/portal/dashboard` | `getDashboard`（dashboard.ts） | ✅ 已适配 |
| `GET /internal/portal/dashboard/stars` | `getDashboardStars`（dashboard.ts） | ✅ 已适配 |
| `GET /internal/portal/dashboard/comments` | `getDashboardComments`（dashboard.ts） | ✅ 已适配（`PortalCommentItem` → `DashboardCommentItem`） |
| `GET /internal/portal/departments` / `/:departmentId` | `listDepartments` / `getDepartment`（apps.ts） | ✅ 已适配（成员/负责人/memberCount 来自 metadata，缺省时页面隐藏） |
| `GET /internal/portal/skill-packages` / `/:packageSlug` | `listSkillPackages` / `getSkillPackage`（skills.ts） | ✅ 已适配 |
| `GET /internal/portal/apps-hunt` | `getAppsHunt`（apps.ts） | ✅ 已适配（消费服务端按员工计算的 `hasVoted`） |
| `GET /internal/portal/docs/:pageKey` | `getContentPage`（docs.ts） | ✅ 已适配（消费服务端 `summary` 并映射 `ContentPageDto`） |
| `GET /internal/portal/dashboard/publish/app/:applicationId` | `getPublishAppDraft`（dashboard.ts） | ✅ 已适配（回读 `PortalResourceItem + ApplicationDraft`，用于续编） |
| `POST/PUT/complete/GET /internal/portal/dashboard/publish/app/:applicationId/uploads/*` | `createApplicationUpload` / `uploadApplicationContent` / `completeApplicationUpload` / `getApplicationUpload`（dashboard.ts） | ✅ 已适配（raw body、服务端扫描状态和 `assetId`） |

### 写入

| 路由 | 前端函数 | 状态 |
| --- | --- | --- |
| `POST /internal/portal/dashboard/publish` | `createPublishDraft`（dashboard.ts） | ✅ 已适配（app 发 `applicationDraft`，非 app 发 `metadata`） |
| `PUT /internal/portal/dashboard/publish/:type/:id` | `updatePublishDraft`（dashboard.ts） | ✅ 契约已实现（无 UI 消费） |
| `POST /internal/portal/dashboard/publish/:type/:id/versions` | `savePublishVersion`（dashboard.ts） | ✅ 已适配 |
| `POST /internal/portal/dashboard/publish/:type/:id/submit` | `submitPublishDraft`（dashboard.ts） | ✅ 已适配（返回 `PortalResourceItem` → `ResourceSummary`） |
| `POST /internal/portal/dashboard/publish/:type/:id/approve` | `approvePublish`（dashboard.ts） | ✅ 契约已实现（无 UI 消费） |
| `POST /internal/portal/dashboard/publish/:type/:id/request-changes` | `requestChangesPublish`（dashboard.ts） | ✅ 契约已实现（无 UI 消费） |
| `POST /internal/portal/dashboard/publish/:type/:id/publish` | `publishLegacy`（dashboard.ts） | ✅ 契约已实现（无 UI 消费） |
| `POST /internal/portal/dashboard/publish/:type/:id/withdraw` | `withdrawPublish`（dashboard.ts） | ✅ 契约已实现（无 UI 消费） |
| `POST /internal/portal/{type}/{id}/favorite` | `favoriteResource`（common.ts） | ✅ 已适配 |
| `POST /internal/portal/{type}/{id}/comments` | `createResourceComment`（common.ts） | ✅ 已适配 |
| `POST /internal/portal/apps-hunt/votes` | `voteForApp`（apps.ts） | ✅ 已适配 |
| `GET /internal/identity/actor` | `getCurrentActor`（common.ts） | ✅ 已适配（直返 `ActorContext`） |
| `POST /internal/identity/logout` | `logout`（common.ts） | ✅ 已适配（204） |
| `GET /internal/identity/login/options` | `getLoginOptions`（auth.ts） | ✅ 已适配（按服务端 methods 条件渲染） |
| `GET /internal/identity/login/challenge` | `getLoginChallenge`（auth.ts） | ✅ 已适配（仅用于密码登录加密） |
| `POST /internal/identity/login/password` | `loginWithPassword`（auth.ts） | ✅ 已适配（RSA-OAEP-256/AES-GCM 信封，不发送明文密码） |
| `GET /internal/identity/login/dingtalk/start` | `startDingTalkLogin`（auth.ts） | ✅ 条件适配（options 未声明时不展示） |

### 错误处理

- `apiFetch` 解析 Problem Details → `ApiError`（status/code/message/traceId/issues），`DRAFT_VALIDATION_FAILED` 的字段级 `issues` 完整保留。
- `publishErrorGuidance`（dashboard.ts）按错误码给「返回编辑 / 刷新重试 / 仅提示」指引；发布页已展示 message + issues。
- 任意接口 401 → 派发 `portal:unauthorized` → `handleUnauthorized`（session.ts）清空 React Query 缓存并跳转登录（`main.tsx` 监听）。

### 缓存失效

- 发布成功：失效 `["portal","dashboard"]`、`["portal","app"]`、`["portal", type]`、`["portal","common","home"]`。
- 收藏切换：失效 `["portal", type]`、`["portal","dashboard"]`、home。
- 评论发布：失效资源评论 + `["portal","dashboard","comments"]` 前缀。

## 2. 静态数据统一管理

生产静态数据统一在 **`src/apis/static-data.ts`**（唯一数据源），页面/组件不再内联字面量；`src/utils/*` 保留 re-export 以兼容既有 import（`resourceLabel`、`publishStatusLabel`、`docsNavigation` 等）。

### 仍为静态数据（无接口来源）

| 数据（static-data 键） | 原散落位置 | 保留原因 |
| --- | --- | --- |
| `resourceCategories`（四类资源分类筛选） | 4 个列表页 | 后端无分类目录读取接口；`applicationDraft.categoryId` 仅引用分类目录，不暴露查询 API |
| `resourceLabels` / `publishStatusLabels` / `resourceTone` / `statusTone` | ResourceBadge、utils | 纯展示映射（AGENTS.md 要求类型化静态映射） |
| `portalNavItems` / `portalMobileNavItems` / `dashboardNavItems` / `docsNavigation` / `footerLinks` | PortalHeader / DashboardLayout / ContentPageView / Footer | 门户导航结构，无接口来源 |
| `publishResourceOptions` / `publishStepLabels` / `mcpConnectionTypes` | PublishPage | 发布向导配置，无接口来源 |
| `resourceSortOptions` / `commentResourceTypeOptions` / `commentSortOptions` / `favoriteResourceTypes` | 列表/评论/收藏页 | 排序与筛选选项为前端约定；后端 `sortBy` 枚举（score/latest/name）由前端映射 |
| `homeHeroTitle` / `homeMarqueeItems` / `homeAccordionSlices` / `homeTypeCards` | HomePage | 首页营销内容，无接口来源 |
| `copy.*`（页面文案、空状态、toast、占位符、登录页文案） | 各页面/组件 | 展示文案，非数据；集中管理便于统一修订 |
| `fallbacks`（默认版本号、changelog、连接类型、`initials`、`greetingName`、`requestFailed` 等） | 表单/组件/API 层 | 接口字段缺失时的回退渲染值 |

### 字段不匹配 → 保留静态渲染（接口有数据但字段无法满足页面模型）

| 场景 | 后端事实（已对照源码） | 前端处理 |
| --- | --- | --- |
| app 列表与详情扩展信息（版本/图标/截图/兼容性/文件） | 列表只返回轻量 metadata；详情由 `buildApplicationMetadata` 投影当前生效版本或草稿，并过滤未通过扫描的资产 | `mapPortalResourceDetail` 从 metadata 映射；缺失版本/报告时保持 `null/unknown`，页面不展示伪造成功 |
| `apps-hunt` 投票态 | `listHunt` 按当前 `actor.employeeId` 计算 `hasVoted` | `getAppsHunt` 原样消费，投票后仍通过查询失效刷新 |
| 技能包条目详情链接 | `getSkillPackage` 条目返回自己的 `ownerEmployeeId/ownerName` | href 使用条目 owner，避免跨员工 Skill 404 |
| 内容页/首页更新摘要 | docs 与 home `updates` 均返回非空 `summary` | `getContentPage`/`getHome` 消费服务端摘要；仅兼容缺失字段时使用空摘要回退 |
| 部门成员/负责人/memberCount | `getDepartment` 的 metadata 可能为空 | 缺省时页面隐藏成员区块与统计 |

## 3. fixtures 与 static-data 的分工

- `src/apis/fixtures.ts`：仅 `VITE_PORTAL_USE_FIXTURES=true`（dev/e2e）下的完整模拟数据（列表/详情/文档/评论种子），由各 API 函数的 `if (useFixtures)` 分支消费；**生产与测试（默认）不进入**。`apps.ts` 的 `featuredApps` fixture 泄漏已删除。
- `src/apis/static-data.ts`：生产路径的静态数据与回退数据，任何模式都会加载。
- 二者共享的文案（如 "首次发布"、`DEMO-EMPLOYEE`）以 static-data 为源，fixtures 保持独立模拟数据。

## 4. 真实后端联调阻塞项

1. **真实后端浏览器冒烟仍受环境阻塞（最大）**：前端已消费登录、草稿回读与四段式上传契约，但当前 `127.0.0.1:3000` 不可用，无法在本地会话/测试数据库上确认 Cookie、扫描和 `in_review` 状态。
2. 应用写入没有清理接口；前端创建成功后保留 `resourceId`，提交失败回编辑使用 `PUT` 更新同一草稿，避免重复创建。测试/验收环境应使用可重置数据库。
3. 资产扫描失败、魔数/MIME/大小校验失败或会话过期时，前端展示服务端 `errorCode` 并要求重新创建上传会话，不重试失败会话。
4. 审核/下架等生命周期接口已按契约实现，但 Portal 一期无审核队列查询和可操作资源来源，继续依赖外部控制台。
5. `score`、`downloads`、`rating` 不属于稳定 `PortalResourceItem` 契约，当前列表仅消费服务端已明确提供的字段，不猜测替代值。

### 4.1 后端支持契约门禁（已满足，前端不越界实现）

- handoff v1.1 已提供同源 Portal 资产上传四段式接口；前端只发送初始化 JSON、raw bytes 和完成请求，不暴露底层存储键，也不把文件名当作 `assetId`。
- handoff v1.1 已提供应用草稿读取接口；前端以 `resourceId/applicationId` 作为稳定身份，刷新时回读完整草稿。
- 本仓库不调用 `/internal/applications/*`，不修改后端、数据库 migration、生产数据或凭据。若后端契约再次变更，应先更新 handoff 再调整适配层。

## 5. 验收状态

- [x] `npm run typecheck` / `npm run lint` / `npm test` / `npm run build`
- [x] fixtures 默认关闭（测试锁定 `useFixtures === false`）
- [x] `PortalResourceItem`/`PortalCommentItem`/`ContentPage` 等 DTO → 页面模型映射（测试锁定）
- [x] `ApiError` 字段级 issues 保留与展示
- [x] 应用请求契约：app 发完整 `applicationDraft`、非 app 发 `metadata`（测试锁定）
- [x] 登录 options/challenge/password/DingTalk 条件入口；加密信封测试确认不含明文密码
- [x] App 发布表单完整草稿校验、字段级 issues 映射、创建失败后复用同一 `resourceId`
- [x] App `web_app` 资产初始化 → raw 上传 → complete 扫描、`assetId` 回填及草稿回读契约测试
- [x] 缺失版本/安全报告时显示未知/待校验，不再展示伪造“扫描通过”
- [x] Cookie 认证（`credentials: "same-origin"`）+ CSRF 头；401 路由恢复；退出登录
- [x] 静态数据统一管理 + 本报告
- [x] Portal 资产上传与草稿回读接口（handoff v1.1 已提供并接入）
- [ ] 真实后端浏览器端到端冒烟（需后端 `127.0.0.1:3000` 可用）
