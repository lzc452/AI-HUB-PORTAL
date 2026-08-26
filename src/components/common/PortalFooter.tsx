import { Link } from "react-router-dom";

export function PortalFooter() {
  return (
    <footer className="border-t border-border py-10 text-[13px] text-muted-foreground">
      <div className="mx-auto grid w-[min(1180px,calc(100%-48px))] grid-cols-[2fr_1fr_1fr] gap-16 max-md:w-[calc(100%-28px)] max-md:grid-cols-1 max-md:gap-7">
        <div>
          <strong className="text-lg text-foreground">AI Hub</strong>
          <p className="max-w-[480px] leading-relaxed">面向员工的可信 AI 应用、技能、插件与 MCP 发现和发布平台。</p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-1 text-sm text-foreground">快捷入口</h3>
          <Link className="hover:text-foreground" to="/tutorials">使用指南</Link>
          <Link className="hover:text-foreground" to="/updates">更新日志</Link>
          <Link className="hover:text-foreground" to="/about">关于我们</Link>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-1 text-sm text-foreground">工作台</h3>
          <Link className="hover:text-foreground" to="/dashboard/publish">发布资源</Link>
          <Link className="hover:text-foreground" to="/dashboard/stars">我的收藏</Link>
          <Link className="hover:text-foreground" to="/dashboard/comments">我的评论</Link>
        </div>
      </div>
      <div className="mx-auto mt-8 w-[min(1180px,calc(100%-48px))] border-t border-border pt-4 max-md:w-[calc(100%-28px)]">© 2026 AI Hub · 仅限企业内部使用</div>
    </footer>
  );
}
