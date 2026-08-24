import { Suspense } from "react";
import { MessageCircle, PackagePlus, Settings, Star, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { LoadingState, PortalHeader, ToastHost } from "@/components/common";

const items = [
  { href: "/dashboard", label: "个人中心", icon: UserRound, end: true },
  { href: "/dashboard/publish", label: "发布", icon: PackagePlus },
  { href: "/dashboard/setting", label: "设置", icon: Settings },
  { href: "/dashboard/stars", label: "收藏", icon: Star },
  { href: "/dashboard/comments", label: "评论", icon: MessageCircle },
];

export function DashboardLayout() {
  return <><PortalHeader /><div className="dashboard-shell"><aside className="dashboard-sidebar"><nav>{items.map(({ href, label, icon: Icon, end }) => <NavLink key={href} to={href} end={end} className={({ isActive }) => isActive ? "is-active" : ""}><Icon size={17} />{label}</NavLink>)}</nav><a className="dashboard-console-link" href="/console/">进入管理控制台</a></aside><main className="dashboard-content"><Suspense fallback={<LoadingState label="正在加载工作台" />}><Outlet /></Suspense></main></div><ToastHost /></>;
}
