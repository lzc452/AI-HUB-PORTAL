# Resource Detail 组件规格

## DOM

`main > breadcrumb + resource-hero + tabs + content-grid(main-content + action-card)`

- 容器最大宽度 `1180px`。
- Hero 图标 `72px`，标题 `30px/700`，标签高度 `24px`。
- Tab 高度 `48px`，active 使用 `2px` 黑色下边框。
- 内容栅格 `minmax(0,1fr) 300px`，间距 `32px`。
- Action Card 边框 `#e7e7ea`，圆角 `14px`，padding `20px`，sticky top `84px`。

## 交互

- Tab 更新 `tab` search param。
- 收藏、评分、安装、评论均有 loading/disabled 状态。
- 小于 `900px` 时单列，Action Card 移到正文前。
