import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { UserRound } from "lucide-react";
import { copy } from "@/apis/static-data";
import { LoadingState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentActor } from "@/hooks";
import { useLoginDialogStore } from "@/store";

/**
 * 登录后可见区域守卫（个人中心等）：未登录时展示登录提示并自动弹出登录弹窗，
 * 登录成功后跳回原页面继续浏览。门户浏览类页面不受此守卫约束。
 */
export function AuthGuard() {
  const location = useLocation();
  const actor = useCurrentActor();
  const openLoginDialog = useLoginDialogStore((s) => s.openLoginDialog);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    if (actor.isError && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      openLoginDialog({ returnTo: `${location.pathname}${location.search}${location.hash}` });
    }
  }, [actor.isError, location.pathname, location.search, location.hash, openLoginDialog]);

  if (actor.isPending) return <LoadingState label="正在验证登录状态" />;
  if (actor.isError) return <LoginRequiredPanel />;
  return <Outlet />;
}

function LoginRequiredPanel() {
  const location = useLocation();
  const openLoginDialog = useLoginDialogStore((s) => s.openLoginDialog);
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md rounded-3xl shadow-xl">
        <CardContent className="flex flex-col items-center p-8 text-center max-md:p-6">
          <span className="grid size-16 place-items-center rounded-2xl bg-white text-muted-foreground shadow-sm ring-1 ring-border"><UserRound size={28} /></span>
          <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">{copy.login.requiredTitle}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.login.requiredDescription}</p>
          <Button className="mt-6 w-full" onClick={() => openLoginDialog({ returnTo })}>{copy.login.requiredButton}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
