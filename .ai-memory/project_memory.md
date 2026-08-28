# Project Memory

## Glossary

- PortalResourceItem | Portal 资源项 | Portal 读取和发布返回的统一资源 DTO，前端必须经适配层映射为页面模型 | 2026-08-27
- applicationDraft | 应用完整草稿 | App 创建/更新/提交使用的完整 ApplicationDraft；不可用任意 Portal metadata 替代 | 2026-08-27

## Decisions

- 生产路径 `VITE_PORTAL_USE_FIXTURES=false`；fixtures 只用于本地 Fixture E2E。
- App 首阶段只实现 `web_app`；资产上传和草稿回读必须由同源 Portal 后端契约提供，Portal 前端不访问 `/internal/applications/*`。
