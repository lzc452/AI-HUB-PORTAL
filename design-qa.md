# AI Hub Portal Design QA

## Comparison target

- Source visual truth: `docs/design-references/skillhub-cn/captured/home-desktop.png`, `skills-list-desktop.png`, `skill-detail-desktop.png`, plus the captured tablet/mobile references in the same directory.
- Research rules: `docs/research/skillhub-cn/portal/PAGE_TOPOLOGY.md` and the component specifications under `docs/research/skillhub-cn/portal/components/`.
- Implementation: Browser-rendered `http://127.0.0.1:4173/` and the一期 routes in the local `AI-HUB-PORTAL` preview.
- Browser: Codex In-app Browser, Chromium-compatible renderer, `deviceScaleFactor=1`.

## Evidence

| Surface | Source pixels / CSS viewport | Implementation pixels / CSS viewport | State | Comparison evidence |
| --- | --- | --- | --- | --- |
| 首页桌面 | `1435x6349`, source capture viewport约 `1440px` | `1425x878`, CSS `1440x900` | 初始滚动位置 | `docs/design-references/ai-hub-portal/home-desktop-comparison-final.png` |
| 首页移动 | `385x7604`, source capture viewport约 `390px` | `375x812`, CSS `390x844` | 初始滚动位置 | `docs/design-references/ai-hub-portal/home-mobile-final.png` |
| 资源列表桌面 | `1435x2848`, source capture viewport约 `1440px` | `1424x1513`, CSS `1440x900` | Apps 列表、列表视图 | `docs/design-references/ai-hub-portal/resource-list-desktop-comparison.png` |
| 资源详情桌面 | `1435x11093`, source capture viewport约 `1440px` | `1424x1207`, CSS `1440x900` | 概述 Tab、右侧操作卡 | `docs/design-references/ai-hub-portal/resource-detail-desktop-comparison.png` |
| 代码详情移动 | 390px source detail reference | `374x2214`, CSS `390x844` | 代码 Tab、文件树、复制按钮 | `docs/design-references/ai-hub-portal/app-detail-code-mobile-recheck.png` |
| 评论工作台 | 390px/1440px reference | `374x954` / `1440x900` | 收到的回复默认视图 | `docs/design-references/ai-hub-portal/dashboard-comments-mobile.png`, `dashboard-comments-desktop.png` |

截图在同一比较输入中并排归一化：桌面比较裁剪到首屏 `900px`，内容宽度统一到实现的可视宽度；移动比较使用 `390px` CSS 目标，浏览器滚动条造成的 `15px` 内容宽度差单独记录，不计为布局偏差。

## Browser-rendered interaction checks

- 首页能力横向轮播：桌面点击“查看下一组能力”后，`.home-capabilities.scrollLeft` 从 `0` 变为 `108`；移动端改为单列可横向滑动卡片且页面 `scrollWidth` 不超过内容宽度。
- 四类资源列表：Apps、Skills、Plugins、MCP 均可在卡片/列表之间切换，并在刷新后保持 Zustand 持久化视图偏好。
- 四类资源详情：概述、版本/文件、代码、安装、评论、安全报告 Tab 均可访问；代码 Tab 使用 `react-arborist` 文件树和 `react-syntax-highlighter`，复制按钮可见并完成剪贴板动作。
- 评论工作台：`收到的回复` 与 `我的评论` 使用 URL `view` 参数切换，资源类型、排序和分页均读取 search params。
- 统一发布：App、Skill、Plugin、MCP 都能进入元数据、资产、安全扫描、提交审核步骤。
- 路由与回退：`/apps` 默认补全 `sortBy=score`，`/department` 重定向到 `/department-zone`，Portal 与 Console 同域路径可打开。
- Console：浏览器控制台无 error；仅有 React Router v7 future flag warning，不影响渲染或交互。

## Fidelity review

- Fonts and typography：Portal 继续使用 `Plus Jakarta Sans`、系统字体和 `PingFang SC` fallback；标题、列表行、Tab 和移动端断点与采集规格保持同一层级。
- Spacing and layout rhythm：Header 约 `61px` sticky；列表宽度、行高、详情主栏/操作栏栅格和移动端单列规则与规格一致；未出现非预期横向滚动。
- Colors and visual tokens：白底、浅灰分隔线、黑色主按钮、细圆角、低阴影和淡色资源类型 token 与 SkillHub 证据一致；首页能力卡使用同一视觉语言的业务分组色。
- Image quality and asset fidelity：AI Hub logo 使用本地 `src/assets/ai-hub-logo.png`；源站品牌图片没有运行时热链，缺失资源使用业务首字母回退，不使用 emoji、CSS 绘图或手工 SVG 假造品牌资产。
- Copy and content：SkillHub 的业务文案按照计划映射为 App、Skill、Plugin、MCP、部门和评论业务；路由、交互标签与一期计划一致。

## Findings

没有可操作的 P0、P1 或 P2 问题。首页业务文案、Logo 和能力卡内容与 SkillHub 源站不同，这是一期业务映射和禁止热链外部品牌资产的明确约束；保留为 P3 后续品牌校准项，不阻断一期验收。

## Comparison history

- 初始首页比较发现能力区为静态三列，且卡片文案在窄宽度下可能与操作链接重叠；已改为可滚动能力 rail、加入桌面前后控制、增加移动端单列规则和卡片底部空间。
- 修正后重新捕获 `home-desktop-final.png`、`home-mobile-final.png` 并再次验证轮播 scrollLeft、页面宽度和桌面/移动截图。
- 资源列表、详情和代码查看器未发现 P0/P1/P2 回归，无需额外修复轮次。

## Implementation checklist

- [x] Desktop 1440px capture and comparison
- [x] Tablet/mobile responsive rules from source evidence
- [x] Resource list grid/list state
- [x] Detail tabs, file tree, code syntax highlighting and copy
- [x] Markdown rendering with sanitization
- [x] Comments dual view and URL state
- [x] Console errors checked
- [x] No unexpected horizontal overflow
- [x] `typecheck`, `lint`, unit tests, production build, Sites tests and Playwright E2E passed

## Follow-up polish

- [P3] 如果后续取得 AI Hub 正式品牌字体或授权的 Portal 插画，可替换当前本地 Logo 与首字母回退资产；不改变路由、状态或组件结构。
- [P3] 可按真实生产内容长度补充更多资源文件节点和 Markdown 示例，继续进行截图基准校准。

final result: passed
