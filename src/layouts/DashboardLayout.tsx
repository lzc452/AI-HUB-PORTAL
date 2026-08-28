import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { dashboardNavItems } from "@/apis/static-data";
import { LoadingState, PortalHeader } from "@/components/common";
import { cn } from "@/utils";

export function DashboardLayout() {
  return <><PortalHeader /><div className="min-h-[calc(100vh-61px)] bg-muted/30 min-[901px]:grid min-[901px]:grid-cols-[220px_minmax(0,1fr)]"><aside className="sticky top-[61px] flex h-[calc(100vh-61px)] flex-col border-r border-border bg-muted/70 px-4 py-6 max-[900px]:static max-[900px]:h-auto max-[900px]:overflow-x-auto max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:px-3 max-[900px]:py-3"><nav className="flex flex-col gap-1 max-[900px]:w-max max-[900px]:flex-row">{dashboardNavItems.map(({ href, label, icon: Icon, end }) => <NavLink key={href} to={href} end={end} className={({ isActive }) => cn("flex min-h-[42px] items-center gap-2.5 rounded-lg border border-transparent px-3 text-sm font-medium text-muted-foreground hover:bg-white/70 hover:text-foreground max-[900px]:min-w-max", isActive && "border-border bg-white text-foreground shadow-sm")}><Icon size={17} />{label}</NavLink>)}</nav><a className="mt-auto px-3 py-3 text-[13px] text-muted-foreground hover:text-foreground max-[900px]:hidden" href="/console/">进入管理控制台</a></aside><main className="min-w-0 w-[min(1104px,100%)] px-8 py-9 pb-[72px] max-[900px]:px-5 max-[900px]:py-7 max-md:pb-14"><Suspense fallback={<LoadingState label="正在加载工作台" />}><Outlet /></Suspense></main></div></>;
}
