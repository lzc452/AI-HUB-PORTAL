import { useSearchParams } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EmptyState, ErrorState, LoadingState, Pagination, ResourceCard } from "@/components/common";
import { copy, favoriteResourceTypes } from "@/apis/static-data";
import { useDashboardStarsQuery } from "@/hooks";
import type { ResourceType } from "@/types";
import { resourceLabel } from "@/utils";

export default function StarsPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const resourceType = params.get("resourceType") as ResourceType | null;
  const query = useDashboardStarsQuery(page, 20);
  if (query.isPending) return <LoadingState label={copy.stars.loading} />;
  if (query.isError || !query.data) return <ErrorState retry={() => query.refetch()} />;
  const items = resourceType ? query.data.items.filter((item) => item.type === resourceType) : query.data.items;
  const update = (key: string, value?: string) => setParams((current) => { if (value) current.set(key, value); else current.delete(key); if (key !== "page") current.set("page", "1"); return current; }, { replace: true });
  return <div className="space-y-5"><header className="mb-7"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{copy.stars.eyebrow}</span><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{copy.stars.title}</h1><p className="mt-1 text-sm text-muted-foreground">{copy.stars.description}</p></header><ToggleGroup type="single" value={resourceType ?? "all"} onValueChange={(value) => value && update("resourceType", value === "all" ? undefined : value)} variant="outline" size="sm" aria-label="收藏资源类型"><ToggleGroupItem value="all">{copy.stars.allTypes}</ToggleGroupItem>{favoriteResourceTypes.map((type) => <ToggleGroupItem key={type} value={type}>{resourceLabel(type)}</ToggleGroupItem>)}</ToggleGroup>{items.length ? <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">{items.map((item) => <ResourceCard key={`${item.type}-${item.id}`} resource={item} />)}</div> : <EmptyState title={copy.stars.emptyTitle} description={copy.stars.emptyDescription} />}{query.data.total > query.data.pageSize && <Pagination page={page} pageSize={query.data.pageSize} total={query.data.total} onChange={(value) => update("page", String(value))} />}</div>;
}
