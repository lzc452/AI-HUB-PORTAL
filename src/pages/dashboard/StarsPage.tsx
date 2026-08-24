import { useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState, Pagination, ResourceCard } from "@/components/common";
import { useDashboardStarsQuery } from "@/hooks";
import type { ResourceType } from "@/types";
import { resourceLabel } from "@/utils";

export default function StarsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const resourceType = params.get("resourceType") as ResourceType | null;
  const query = useDashboardStarsQuery(page, 20);
  if (query.isPending) return <LoadingState label="正在加载收藏" />;
  if (query.isError || !query.data) return <ErrorState retry={() => query.refetch()} />;
  const items = resourceType ? query.data.items.filter((item) => item.type === resourceType) : query.data.items;
  const update = (key: string, value?: string) => setParams((current) => { if (value) current.set(key, value); else current.delete(key); if (key !== "page") current.set("page", "1"); return current; }, { replace: true });
  return <div className="dashboard-page"><header className="dashboard-page-heading"><div><span className="portal-kicker">Saved resources</span><h1>我的收藏</h1><p>集中查看你标记过的 App、Skill、Plugin 与 MCP。</p></div></header><div className="dashboard-filter-row"><button className={!resourceType ? "is-active" : ""} onClick={() => update("resourceType")}>全部</button>{(["app", "skill", "plugin", "mcp"] as ResourceType[]).map((type) => <button key={type} className={resourceType === type ? "is-active" : ""} onClick={() => update("resourceType", type)}>{resourceLabel(type)}</button>)}</div>{items.length ? <div className="resource-grid dashboard-resource-grid">{items.map((item) => <ResourceCard key={`${item.type}-${item.id}`} resource={item} />)}</div> : <EmptyState title="这里还没有收藏" description="在资源详情页点击收藏，稍后就能从这里快速找到。" />}{query.data.total > query.data.pageSize && <Pagination page={page} pageSize={query.data.pageSize} total={query.data.total} onChange={(value) => update("page", String(value))} />}</div>;
}
