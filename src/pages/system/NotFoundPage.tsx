import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return <main className="portal-page portal-container system-page"><SearchX size={42} /><span className="portal-kicker">404 Not Found</span><h1>没有找到这个页面</h1><p>链接可能已经更新，或当前账号没有访问权限。</p><Link className="portal-button portal-button--primary" to="/"><ArrowLeft size={15} />返回门户首页</Link></main>;
}
