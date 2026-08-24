import { ArrowRight, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import logoUrl from "@/assets/ai-hub-logo.png";
import { isSafeReturnTo } from "@/utils";

export default function LoginPage() {
  const [params] = useSearchParams();
  const candidate = params.get("returnTo") ?? "/";
  const returnTo = isSafeReturnTo(candidate) ? candidate : "/";
  const href = `/internal/identity/login/dingtalk/start?returnTo=${encodeURIComponent(returnTo)}`;
  return <main className="login-page"><section className="login-card portal-card"><span className="login-logo"><img src={logoUrl} alt="" /></span><span className="portal-kicker">Enterprise AI Portal</span><h1>登录 AI Hub</h1><p>使用企业统一身份进入资源门户。登录后将返回你刚才访问的页面。</p><a className="portal-button portal-button--primary" href={href}>使用钉钉登录<ArrowRight size={16} /></a><small><ShieldCheck size={14} />仅使用必要的员工与部门信息完成鉴权</small></section></main>;
}
