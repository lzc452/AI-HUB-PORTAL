import { ArrowRight, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import logoUrl from "@/assets/ai-hub-logo.png";
import { isSafeReturnTo } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [params] = useSearchParams();
  const candidate = params.get("returnTo") ?? "/";
  const returnTo = isSafeReturnTo(candidate) ? candidate : "/";
  const href = `/internal/identity/login/dingtalk/start?returnTo=${encodeURIComponent(returnTo)}`;
  return <main className="grid min-h-screen place-items-center bg-muted/30 px-5 py-12"><Card className="w-full max-w-md rounded-3xl shadow-xl"><CardContent className="flex flex-col items-center p-8 text-center max-md:p-6"><span className="grid size-16 place-items-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-border"><img src={logoUrl} alt="AI Hub" className="size-full object-contain" /></span><span className="mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Enterprise AI Portal</span><h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">登录 AI Hub</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">使用企业统一身份进入资源门户。登录后将返回你刚才访问的页面。</p><Button asChild className="mt-6 w-full"><a href={href}>使用钉钉登录<ArrowRight size={16} /></a></Button><small className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck size={14} />仅使用必要的员工与部门信息完成鉴权</small></CardContent></Card></main>;
}
