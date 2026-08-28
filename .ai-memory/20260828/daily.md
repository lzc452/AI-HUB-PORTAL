# Daily memory — 2026-08-28

## 真实联调收尾

- 重新核对 `AI-HUB-PLATFORM/docs/handoff/ai-hub-portal-api.md` v1.1：Portal 已提供应用草稿回读和四段式资产上传接口；前端接入 `GET draft`、初始化会话、raw body 上传、complete 扫描和状态查询。
- `PublishPage` 仅开放 `web_app`，先创建完整 `applicationDraft` 获得 `resourceId`，再上传真实截图；服务端返回的 `assetId` 才会写回草稿。提交失败复用同一 ID 并用 `PUT` 更新，不重复创建。
- 同步后端 DTO：`apps-hunt.hasVoted` 原样映射；技能包条目使用自身 `ownerEmployeeId/ownerName` 生成链接；docs/home updates 消费服务端 `summary`。
- 删除“资产服务未接入”文案，未知/待扫描状态不显示成功结论；详情缺少安全报告时保持 `unknown`。

## 验证

- `npm run typecheck`：通过。
- `npm run lint`：通过；保留 5 个 shadcn/ui Fast Refresh warning，无错误。
- `npm test -- --run`：30 个 Vitest 测试通过（含上传、草稿回读、登录加密和字段映射）。
- Fixture Playwright desktop/mobile：分别 10/10 通过；按用户要求后续不再运行 E2E。
- `npm run test:sites`：4/4 通过。
- `npm run build`：通过并生成 Sites 所需产物；后续仅文案改动导致的重复构建审批超时，不代表构建失败。
- 真实后端浏览器冒烟仍未执行：`127.0.0.1:3000` 未提供可用会话/测试数据库，真实 E2E 仅在缺少凭据时安全跳过。
