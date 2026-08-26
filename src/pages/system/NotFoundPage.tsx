import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-5 py-12 text-center"><SearchX className="size-11 text-muted-foreground" /><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">404 Not Found</span><h1 className="text-3xl font-semibold tracking-[-0.04em]">没有找到这个页面</h1><p className="max-w-md text-sm text-muted-foreground">链接可能已经更新，或当前账号没有访问权限。</p><Button asChild className="mt-2"><Link to="/"><ArrowLeft size={15} />返回门户首页</Link></Button></main>;
}
