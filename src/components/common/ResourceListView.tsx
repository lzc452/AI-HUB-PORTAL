import { Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import type { PageResult, ResourceSummary } from "@/types";
import { EmptyState, ErrorState, LoadingState, Pagination, ResourceCard } from "@/components/common";
import { useListUrlState } from "@/hooks";

interface ResourceListViewProps<T extends ResourceSummary> {
  title: string;
  description: string;
  data?: PageResult<T>;
  pending: boolean;
  error: boolean;
  retry: () => void;
  display: "grid" | "list";
  onDisplayChange: (display: "grid" | "list") => void;
  categories?: string[];
}

export function ResourceListView<T extends ResourceSummary>({ title, description, data, pending, error, retry, display, onDisplayChange, categories = [] }: ResourceListViewProps<T>) {
  const { query, update } = useListUrlState();
  const hasFilter = Boolean(query.q || query.category);
  return (
    <main className="portal-page portal-container resource-list-page">
      <header className="resource-list-heading">
        <div><span className="portal-kicker">AI Hub Directory</span><h1>{title}</h1><p>{description}</p></div>
        <strong>{data?.total ?? 0}<small> 项资源</small></strong>
      </header>
      <section className="resource-toolbar" aria-label={`${title}筛选`}>
        <div className="resource-sort-tabs" role="group" aria-label="排序方式">
          {[{ key: "score", label: "精选" }, { key: "downloads", label: "下载量" }, { key: "updatedAt", label: "最近上新" }].map((item) => <button key={item.key} className={query.sortBy === item.key ? "is-active" : ""} onClick={() => update({ sortBy: item.key })}>{item.label}</button>)}
        </div>
        <label className="resource-search"><Search size={15} /><span className="sr-only">搜索</span><input value={query.q ?? ""} onChange={(event) => update({ q: event.target.value || undefined })} placeholder={`搜索${title}`} />{query.q && <button aria-label="清除搜索" onClick={() => update({ q: undefined })}><X size={14} /></button>}</label>
        {categories.length > 0 && <label className="resource-select"><SlidersHorizontal size={14} /><span className="sr-only">分类</span><select value={query.category ?? ""} onChange={(event) => update({ category: event.target.value || undefined })}><option value="">全部分类</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>}
        <div className="display-toggle" role="group" aria-label="显示方式"><button className={display === "list" ? "is-active" : ""} aria-label="列表显示" aria-pressed={display === "list"} onClick={() => onDisplayChange("list")}><List size={16} /></button><button className={display === "grid" ? "is-active" : ""} aria-label="卡片显示" aria-pressed={display === "grid"} onClick={() => onDisplayChange("grid")}><Grid2X2 size={16} /></button></div>
      </section>
      <section className="resource-state-region" aria-live="polite">
        {pending ? <LoadingState label={`正在加载${title}`} /> : error ? <ErrorState retry={retry} /> : !data?.items.length ? <EmptyState title="没有找到匹配资源" description="尝试更换搜索词或清除筛选条件。" action={hasFilter ? <button className="portal-button" onClick={() => update({ q: undefined, category: undefined, page: 1 })}>清除筛选</button> : undefined} /> : <div className={display === "grid" ? "resource-grid" : "resource-list"}>{data.items.map((resource) => <ResourceCard key={resource.id} resource={resource} compact={display === "list"} />)}</div>}
      </section>
      {data && data.total > data.pageSize && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={(page) => update({ page })} />}
    </main>
  );
}
