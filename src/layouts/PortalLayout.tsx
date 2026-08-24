import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { LoadingState, PortalFooter, PortalHeader, ToastHost } from "@/components/common";

export function PortalLayout() {
  return <><PortalHeader /><Suspense fallback={<main className="portal-page portal-container"><LoadingState label="正在加载页面" /></main>}><Outlet /></Suspense><PortalFooter /><ToastHost /></>;
}
