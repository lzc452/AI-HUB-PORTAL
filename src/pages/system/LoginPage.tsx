import { useState } from "react";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logoUrl from "@/assets/ai-hub-logo.png";
import { ApiError, startDingTalkLogin } from "@/apis";
import { copy } from "@/apis/static-data";
import { useLoginMutation, useLoginOptionsQuery } from "@/hooks";
import { isSafeReturnTo } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const options = useLoginOptionsQuery();
  const login = useLoginMutation();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [dingTalkPending, setDingTalkPending] = useState(false);
  const candidate = params.get("returnTo") ?? "/";
  const returnTo = isSafeReturnTo(candidate) ? candidate : "/";
  const methods = options.data?.methods ?? [];

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    const normalizedEmployeeId = employeeId.trim();
    if (!normalizedEmployeeId || !password) {
      setFormError("请输入员工 ID 和密码。");
      return;
    }
    login.mutate({ employeeId: normalizedEmployeeId, password }, {
      onSuccess: () => {
        setPassword("");
        navigate(returnTo, { replace: true });
      },
      onError: (error) => {
        setPassword("");
        setFormError(error instanceof ApiError && error.code === "LOGIN_RATE_LIMITED" ? "登录尝试过于频繁，请稍后再试。" : copy.login.failed);
      },
    });
  };

  const beginDingTalk = async () => {
    setFormError(null);
    setDingTalkPending(true);
    try {
      const result = await startDingTalkLogin(returnTo);
      window.location.assign(result.redirectUrl);
    } catch {
      setFormError(copy.login.dingTalkFailed);
      setDingTalkPending(false);
    }
  };

  return <main className="grid min-h-screen place-items-center bg-muted/30 px-5 py-12"><Card className="w-full max-w-md rounded-3xl shadow-xl"><CardContent className="p-8 max-md:p-6"><div className="flex flex-col items-center text-center"><span className="grid size-16 place-items-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-border"><img src={logoUrl} alt="AI Hub" className="size-full object-contain" /></span><span className="mt-6 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{copy.login.eyebrow}</span><h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{copy.login.title}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.login.description}</p></div>{options.isPending ? <div className="mt-7 flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" size={16} />正在获取登录方式</div> : options.isError ? <div className="mt-7 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{copy.login.unavailable}<Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => options.refetch()}>重试</Button></div> : <div className="mt-7 space-y-3">{methods.includes("password") && <form className="space-y-4" onSubmit={submit}><Field><FieldLabel htmlFor="login-employee-id">{copy.login.employeeIdLabel}</FieldLabel><Input id="login-employee-id" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder={copy.login.employeeIdPlaceholder} autoComplete="username" disabled={login.isPending} /></Field><Field><FieldLabel htmlFor="login-password">{copy.login.passwordLabel}</FieldLabel><Input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={copy.login.passwordPlaceholder} autoComplete="current-password" disabled={login.isPending} /><FieldError>{formError}</FieldError></Field><Button type="submit" className="w-full" disabled={login.isPending}>{login.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}{copy.login.passwordMethod}</Button></form>}{methods.includes("dingtalk_sso") && <Button type="button" variant="outline" className="w-full" disabled={dingTalkPending} onClick={beginDingTalk}>{dingTalkPending ? <LoaderCircle className="animate-spin" size={16} /> : <ArrowRight size={16} />}{copy.login.dingtalkMethod}</Button>}{methods.length === 0 && <p className="rounded-xl border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">{copy.login.unavailable}</p>}{formError && !methods.includes("password") && <p className="text-sm text-red-700" role="alert">{formError}</p>}</div>}<small className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck size={14} />{copy.login.note}</small></CardContent></Card></main>;
}
