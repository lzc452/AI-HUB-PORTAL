import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoUrl from "@/assets/ai-hub-logo.png";
import { ApiError, completeDingTalkLogin, createDingTalkCallbackPath, startDingTalkLogin } from "@/apis";
import { copy } from "@/apis/static-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLoginMutation, useLoginOptionsQuery } from "@/hooks";
import { useLoginDialogStore } from "@/store";
import { currentReturnTo, isSafeReturnTo } from "@/utils";

/**
 * 全局登录弹窗：浏览门户无需登录；下载/点赞/评论/收藏/个人中心等操作
 * 未登录时通过 useRequireLogin 或 AuthGuard 打开本弹窗，登录成功后继续原动作。
 */
export function LoginDialog() {
  const request = useLoginDialogStore((s) => s.request);
  const openLoginDialog = useLoginDialogStore((s) => s.openLoginDialog);
  const closeLoginDialog = useLoginDialogStore((s) => s.closeLoginDialog);
  const navigate = useNavigate();
  const login = useLoginMutation();
  const options = useLoginOptionsQuery(Boolean(request));
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [dingTalkPending, setDingTalkPending] = useState(false);
  const [dingTalkCompleted, setDingTalkCompleted] = useState(false);
  const dingTalkCompletionRef = useRef<Promise<void> | null>(null);
  const requestRef = useRef(request);
  requestRef.current = request;
  const methods = options.data?.methods ?? [];

  // 钉钉 OAuth 回调入口：应用启动时 URL 携带 dingtalk=complete，自动打开弹窗完成会话。
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dingtalk") !== "complete") return;
    if (useLoginDialogStore.getState().request?.dingTalkComplete) return;
    const candidate = params.get("returnTo") ?? "/";
    openLoginDialog({ returnTo: isSafeReturnTo(candidate) ? candidate : "/", dingTalkComplete: true });
  }, [openLoginDialog]);

  // 弹窗每次打开时重置表单状态。
  useEffect(() => {
    if (!request) return;
    setEmployeeId("");
    setPassword("");
    setFormError(null);
    setDingTalkPending(false);
    setDingTalkCompleted(false);
  }, [request]);

  const finishLogin = () => {
    const current = requestRef.current;
    current?.onSuccess?.();
    closeLoginDialog();
    if (current?.returnTo) navigate(current.returnTo, { replace: true });
  };

  // 钉钉回调：用 HttpOnly handoff cookie 换取会话，只完成一次，成功后关闭弹窗并跳转 returnTo。
  useEffect(() => {
    if (!request?.dingTalkComplete) {
      dingTalkCompletionRef.current = null;
      return;
    }
    if (dingTalkCompleted) return;
    let active = true;
    setFormError(null);
    setDingTalkPending(true);
    const completion = dingTalkCompletionRef.current ?? completeDingTalkLogin().then(() => undefined);
    dingTalkCompletionRef.current = completion;
    void completion.then(
      () => {
        if (!active) return;
        setDingTalkCompleted(true);
        setDingTalkPending(false);
        requestRef.current?.onSuccess?.();
        closeLoginDialog();
        if (requestRef.current?.returnTo) navigate(requestRef.current.returnTo, { replace: true });
      },
      () => {
        if (!active) return;
        dingTalkCompletionRef.current = null;
        setFormError(copy.login.dingTalkFailed);
        setDingTalkPending(false);
      },
    );
    return () => {
      active = false;
    };
  }, [request?.dingTalkComplete, dingTalkCompleted, closeLoginDialog, navigate]);

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
        finishLogin();
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
      const result = await startDingTalkLogin(createDingTalkCallbackPath(request?.returnTo ?? currentReturnTo()));
      window.location.assign(result.redirectUrl);
    } catch {
      setFormError(copy.login.dingTalkFailed);
      setDingTalkPending(false);
    }
  };

  return (
    <Dialog open={Boolean(request)} onOpenChange={(open) => { if (!open) closeLoginDialog(); }}>
      <DialogContent className="p-8 max-md:p-6">
        <DialogHeader className="flex flex-col items-center text-center">
          <span className="grid size-16 place-items-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-border"><img src={logoUrl} alt="AI Hub" className="size-full object-contain" /></span>
          <DialogTitle className="mt-5 text-2xl font-semibold tracking-[-0.03em]">{copy.login.title}</DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-relaxed">{copy.login.description}</DialogDescription>
        </DialogHeader>
        {dingTalkPending ? <div className="mt-2 flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" size={16} />正在完成钉钉登录…</div> : options.isPending ? <div className="mt-2 flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" size={16} />正在获取登录方式</div> : options.isError ? <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{copy.login.unavailable}<Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => options.refetch()}>重试</Button></div> : <div className="mt-2 space-y-3">{methods.includes("password") && <form className="space-y-4" onSubmit={submit}><Field><FieldLabel htmlFor="login-employee-id">{copy.login.employeeIdLabel}</FieldLabel><Input id="login-employee-id" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder={copy.login.employeeIdPlaceholder} autoComplete="username" disabled={login.isPending || dingTalkPending} /></Field><Field><FieldLabel htmlFor="login-password">{copy.login.passwordLabel}</FieldLabel><Input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={copy.login.passwordPlaceholder} autoComplete="current-password" disabled={login.isPending || dingTalkPending} /><FieldError>{formError}</FieldError></Field><Button type="submit" className="w-full" disabled={login.isPending || dingTalkPending}>{login.isPending && <LoaderCircle className="animate-spin" size={15} />}{copy.login.button}<ArrowRight size={15} /></Button></form>}{methods.includes("dingtalk_sso") && <Button type="button" variant="outline" className="w-full" disabled={dingTalkPending || login.isPending} onClick={beginDingTalk}>{dingTalkPending ? <LoaderCircle className="animate-spin" size={15} /> : <ShieldCheck size={15} />}{copy.login.dingtalkMethod}</Button>}<p className="pt-1 text-center text-xs text-muted-foreground">{copy.login.note}</p></div>}
      </DialogContent>
    </Dialog>
  );
}
