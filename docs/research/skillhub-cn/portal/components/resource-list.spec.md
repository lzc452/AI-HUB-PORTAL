# Resource List 组件规格

## DOM

`section.resource-list > header + toolbar + state-region(list | grid | skeleton | empty | error) + pagination`

- 内容最大宽度 `1180px`。
- 标题 `32px/700`，说明 `14px` 灰色。
- Toolbar 高度至少 `44px`，Tab 与筛选间使用弹性空白。
- 列表行最小高度 `82px`，上下 padding `16px`，底边框 `#eeeeef`。
- 图标 `44px`，圆角 `10px`；名称 `15px/650`；摘要 `13px`，单行截断。
- Grid 为三列，`gap: 16px`；平板两列；移动一列。

## 状态

- Hover：背景 `#fafafa`。
- Active：背景 `#f5f5f5`。
- Disabled：opacity `.45`，不响应 pointer。
- Skeleton 保持行高，避免布局跳动。
