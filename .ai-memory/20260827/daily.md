session-id: 20260827-0958

## [09:58] - [实现启动]: 进入真实认证与 Web App 发布闭环

- **文件**: `src/apis/common.ts`, `src/apis/dashboard.ts`, `src/pages/dashboard/PublishPage.tsx`, `src/pages/system/LoginPage.tsx`
- **决策**: Password 为必备登录方式；DingTalk 仅在 options 返回时展示；App 下一阶段先闭环 `web_app`。资产上传与草稿回读等待后端 Portal handoff，不在本仓库伪造。
- **验证**: 当前 typecheck/lint/test/build 已有通过证据；真实后端 `127.0.0.1:3000` 尚不可用。
