import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentActor } from "@/hooks";
import { LoadingState } from "@/components/common";
import { loginHref } from "@/utils";

export function SsoGuard() {
  const location = useLocation();
  const actor = useCurrentActor();
  if (actor.isPending) return <main className="portal-page portal-container"><LoadingState label="正在验证企业身份" /></main>;
  if (actor.isError) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate replace to={loginHref(returnTo)} />;
  }
  return <Outlet />;
}
