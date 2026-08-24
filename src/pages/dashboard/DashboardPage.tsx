import { AppWindow, ArrowUpRight, Blocks, Bot, Puzzle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState, LoadingState } from "@/components/common";
import { useDashboardQuery, useCurrentActor } from "@/hooks";
import { formatDate, publishStatusLabel, resourceLabel } from "@/utils";

const typeCards = [
  { type: "app" as const, label: "应用", icon: AppWindow, className: "app" },
  { type: "skill" as const, label: "技能", icon: Blocks, className: "skill" },
  { type: "plugin" as const, label: "插件", icon: Puzzle, className: "plugin" },
  { type: "mcp" as const, label: "MCP", icon: Bot, className: "mcp" },
];

export default function DashboardPage() {
  const actor = useCurrentActor();
  const query = useDashboardQuery();
  if (query.isPending) return <LoadingState label="正在加载个人中心" />;
  if (query.isError || !query.data) return <ErrorState retry={() => query.refetch()} />;
  const data = query.data;
  return <div className="dashboard-page"><header className="dashboard-page-heading"><div><span className="portal-kicker">Personal workspace</span><h1>你好，{actor.data?.displayName ?? "同事"}</h1><p>管理你发布的资源、审核进度与最近更新。</p></div><Link className="portal-button portal-button--primary" to="/dashboard/publish">发布新资源<ArrowUpRight size={15} /></Link></header><section className="dashboard-stat-grid">{typeCards.map(({ type, label, icon: Icon, className }) => <article className={`dashboard-stat dashboard-stat--${className}`} key={type}><span><Icon size={20} /></span><strong>{data.counts[type]}</strong><small>已创建{label}</small></article>)}</section><section className="dashboard-review-banner"><ShieldCheck size={22} /><div><strong>{data.pendingReviewCount} 项资源正在审核</strong><p>审核结果将通过企业消息通知；已发布 {data.publishedCount} 项资源。</p></div></section><section className="dashboard-panel"><div className="dashboard-panel__heading"><h2>最近更新</h2><Link to="/dashboard/publish">继续发布</Link></div><div className="dashboard-table">{data.recent.map((item) => <Link to={item.href} key={`${item.type}-${item.id}`}><div><span className={`resource-type resource-type--${item.type}`}>{resourceLabel(item.type)}</span><strong>{item.name}</strong></div><span className={`status-pill status-pill--${item.status}`}>{publishStatusLabel(item.status)}</span><time>{formatDate(item.updatedAt)}</time><ArrowUpRight size={15} /></Link>)}</div></section></div>;
}
