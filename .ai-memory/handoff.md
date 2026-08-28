# Handoff checkpoint — 2026-08-28 16:20

## 已完成（带证据）

- PortalResourceItem、ActorContext、Dashboard/部门/技能包/App Hunt DTO 适配已实现；`hasVoted`、技能条目 owner、内容 summary 已消费 v1.1 契约。
- fixtures 默认关闭、ApiError 保留 `issues`、发布缓存失效和 401 路由恢复已有实现。
- `npm run typecheck`、`npm run lint`、`npm test -- --run`（30/30）、`npm run build`、`npm run test:sites`（4/4）有通过证据；lint 只有 5 个既有 shadcn Fast Refresh warning。
- Fixture Playwright desktop/mobile 分别 10/10 通过；后续按用户要求不再运行 E2E。

## 当前 Wave

- 真实联调适配已完成，当前仅需后端测试环境做浏览器冒烟验收。

## 未完成/阻塞

- 后端 `127.0.0.1:3000` 当前不可用，无法验证真实 Cookie、密码登录、扫描和 `in_review` 状态；不连接生产数据库。
- 审核队列查询和审核 UI 仍不在 Portal 一期范围，继续由外部控制台消费已有生命周期 API。
