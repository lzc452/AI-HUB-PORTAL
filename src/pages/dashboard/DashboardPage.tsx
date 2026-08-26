import { AppWindow, ArrowUpRight, Blocks, Bot, Puzzle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState, ResourceBadge, StatusBadge } from "@/components/common";
import { useDashboardQuery, useCurrentActor } from "@/hooks";
import { formatDate } from "@/utils";

const typeCards = [
  { type: "app" as const, label: "应用", icon: AppWindow, tone: "bg-indigo-50 text-indigo-700" },
  { type: "skill" as const, label: "技能", icon: Blocks, tone: "bg-violet-50 text-violet-700" },
  { type: "plugin" as const, label: "插件", icon: Puzzle, tone: "bg-emerald-50 text-emerald-700" },
  { type: "mcp" as const, label: "MCP", icon: Bot, tone: "bg-orange-50 text-orange-700" },
];

export default function DashboardPage() {
  const actor = useCurrentActor();
  const query = useDashboardQuery();
  if (query.isPending) return <LoadingState label="正在加载个人中心" />;
  if (query.isError || !query.data) return <ErrorState retry={() => query.refetch()} />;
  const data = query.data;
  return <div className="space-y-5"><header className="mb-7 flex items-end justify-between gap-5 max-md:items-start max-md:flex-col"><div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Personal workspace</span><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">你好，{actor.data?.displayName ?? "同事"}</h1><p className="mt-1 text-sm text-muted-foreground">管理你发布的资源、审核进度与最近更新。</p></div><Button asChild><Link to="/dashboard/publish">发布新资源<ArrowUpRight size={15} /></Link></Button></header><section className="grid grid-cols-4 gap-3 max-[1020px]:grid-cols-2"><>{typeCards.map(({ type, label, icon: Icon, tone }) => <Card className="grid grid-cols-[42px_1fr] gap-x-2.5 p-4 shadow-none" key={type}><span className={`row-span-2 grid size-[42px] place-items-center rounded-xl ${tone}`}><Icon size={20} /></span><strong className="text-[22px]">{data.counts[type]}</strong><small className="text-xs text-muted-foreground">已创建{label}</small></Card>)}</></section><Card className="flex-row items-center gap-3 border-violet-200 bg-violet-50 p-4 text-violet-800 shadow-none"><ShieldCheck size={22} className="shrink-0" /><div><strong className="text-sm">{data.pendingReviewCount} 项资源正在审核</strong><p className="mt-1 text-xs text-violet-700/70">审核结果将通过企业消息通知；已发布 {data.publishedCount} 项资源。</p></div></Card><Card className="overflow-hidden p-0 shadow-none"><div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 className="m-0 text-base font-semibold">最近更新</h2><Link className="text-xs font-semibold hover:underline" to="/dashboard/publish">继续发布</Link></div><div>{data.recent.map((item) => <Link className="grid grid-cols-[minmax(0,1fr)_90px_100px_18px] items-center gap-3 border-b border-border px-5 py-3.5 text-xs last:border-b-0 hover:bg-muted/50 max-md:grid-cols-[1fr_auto]" to={item.href} key={`${item.type}-${item.id}`}><div className="flex min-w-0 items-center gap-2"><ResourceBadge type={item.type} /><strong className="truncate">{item.name}</strong></div><StatusBadge status={item.status} /><time className="text-muted-foreground max-md:hidden">{formatDate(item.updatedAt)}</time><ArrowUpRight size={15} className="max-md:hidden" /></Link>)}</div></Card></div>;
}
