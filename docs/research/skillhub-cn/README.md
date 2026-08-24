# SkillHub 复刻研究索引

采集日期：2026-08-24  
来源站点：`https://skillhub.cn/`  
目标产品：AI Hub Portal 一期

本目录只记录视觉、布局、路由与交互证据，不作为运行时数据源。目标实现中的员工、部门、资源、评论、评分、发布与审核数据全部来自 AI Hub 的 `/internal/portal/*` API。

## 来源与目标映射

| 来源页面 | 目标页面 |
|---|---|
| `/` | `/` |
| `/skills` | `/apps`、`/skills` |
| `/skills/:owner/:slug` | App、Skill 详情 |
| `/plugins` | `/plugins` |
| `/plugins/:owner/:slug` | Plugin 详情 |
| `/skill-hunt` | `/apps-hunt` |
| `/enterprise-zone` | `/department-zone` |
| `/skillspackage` | `/skillpackage` |
| `/tutorials` | `/tutorials` |
| `/dashboard/*` | `/dashboard/*` |

`/mcp`、`/about`、`/updates` 沿用同一设计令牌和组件系统扩展。SkillPay、大赛、Soul、实名认证、API Key、CLI/Agent 发布不进入目标产品。
