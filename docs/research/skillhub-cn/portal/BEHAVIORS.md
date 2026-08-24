# 交互行为

## Header

- Logo 返回首页。
- Apps、Skills、Source、Docs 使用桌面下拉导航；键盘 `Enter`/`Space` 打开，`Escape` 关闭。
- 移动端折叠为抽屉菜单，打开时锁定页面滚动。
- 发布按钮进入 `/dashboard/publish`；用户菜单进入 Dashboard。

## 搜索、筛选与分页

- 搜索、排序、分类、页码写入 URL search params，刷新和分享后状态保持。
- `/apps` 缺少 `sortBy` 时 replace 为 `/apps?sortBy=score`。
- 筛选变化将 `page` 归一为 `1`。
- Loading 使用骨架屏；Empty 保留筛选栏并提供清除筛选；Error 提供重试。

## 卡片与列表

- 卡片和资源行整体可点击；内部收藏、投票等按钮阻止冒泡。
- Hover 使用轻微背景色/边框变化，不改变布局尺寸。
- Focus 必须有可见轮廓。

## 详情

- Tab 通过 URL `tab` 参数保持状态。
- 收藏 mutation 乐观更新，失败时回滚并 Toast。
- 评论仅允许一层回复；对回复再次回复时仍绑定顶层评论。
- 评论提交后滚动到新增评论锚点。

## Dashboard 评论

- 默认视图为 `replies`，展示他人对当前员工评论的直接回复。
- `mine` 展示当前员工发表的评论和回复。
- 资源链接跳转到详情评论位置。
- `resourceType`、`sort`、`page`、`pageSize` 全部来自 URL。

## 统一发布

- 第一步选择资源类型，后续步骤根据 App、Skill、Plugin、MCP 展示元数据与资产字段。
- 发布草稿由 Zustand 按资源类型保存；服务端提交和扫描状态由 TanStack Query 管理。
- 未提交表单离开时弹出确认。
- 流程：草稿 → 元数据 → 资产 → 安全扫描 → 预览 → 审核提交。

## 响应式

- `1440px`：完整 Header、双栏详情、Sidebar Dashboard。
- `768px`：Header 导航收紧，筛选换行，详情右栏下移。
- `390px`：抽屉导航，单列资源卡，Dashboard Sidebar 改为横向滚动导航，按钮最小触控高度 `44px`。
