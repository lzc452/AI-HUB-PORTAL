import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { LoadingState, PortalFooter, PortalHeader } from "@/components/common";

export function PortalLayout() {
  return <><PortalHeader /><Suspense fallback={<main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label="正在加载页面" /></main>}><Outlet /></Suspense><PortalFooter /></>;
}
