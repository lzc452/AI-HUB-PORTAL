# Portal Shell 组件规格

## Header DOM

`header > container > logo + desktop-nav + actions + mobile-menu-button`

- 高度 `60px`，`position: sticky`，`top: 0`，`z-index: 50`。
- 容器最大宽度 `1280px`，桌面水平 padding `24px`。
- Logo 高度 `28px`；导航间距 `28px`；正文 `14px/500`。
- 主按钮黑底白字，圆角 `999px`，高度 `36px`。
- Hover 背景 `#f4f4f5`；Focus 为 `2px` 深色外描边。

## Footer DOM

`footer > container > brand-column + links-column + support-column + legal-row`

- 上边框 `#ececf0`，上下 padding `40px`。
- 桌面三列；小于 `768px` 改为单列。

## 动画

- 导航下拉：opacity `0→1`，translateY `-4px→0`，`160ms ease-out`。
- 移动抽屉：opacity `180ms`；遵守 `prefers-reduced-motion`。
