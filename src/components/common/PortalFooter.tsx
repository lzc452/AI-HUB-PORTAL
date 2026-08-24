import { Link } from "react-router-dom";

export function PortalFooter() {
  return (
    <footer className="portal-footer">
      <div className="portal-container portal-footer__grid">
        <div>
          <strong className="portal-footer__brand">AI Hub</strong>
          <p>面向员工的可信 AI 应用、技能、插件与 MCP 发现和发布平台。</p>
        </div>
        <div>
          <h3>快捷入口</h3>
          <Link to="/tutorials">使用指南</Link>
          <Link to="/updates">更新日志</Link>
          <Link to="/about">关于我们</Link>
        </div>
        <div>
          <h3>工作台</h3>
          <Link to="/dashboard/publish">发布资源</Link>
          <Link to="/dashboard/stars">我的收藏</Link>
          <Link to="/dashboard/comments">我的评论</Link>
        </div>
      </div>
      <div className="portal-container portal-footer__legal">© 2026 AI Hub · 仅限企业内部使用</div>
    </footer>
  );
}
