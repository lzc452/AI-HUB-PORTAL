import { Grid2X2, List, Search, SlidersHorizontal, X } from "lucide-react";
import type { PageResult, ResourceSummary } from "@/types";
import { EmptyState, ErrorState, LoadingState, Pagination, ResourceCard } from "@/components/common";
import { useListUrlState } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 pb-[72px] max-md:w-[calc(100%-28px)] max-md:py-8 max-md:pb-14">
      <header className="mb-7 flex items-end justify-between gap-5 max-md:items-start max-md:flex-col">
        <div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">AI Hub Directory</span><h1 className="mt-2 text-[clamp(30px,4vw,48px)] font-semibold leading-tight tracking-[-0.04em]">{title}</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></div>
        <strong className="text-2xl font-semibold">{data?.total ?? 0}<small className="ml-1 text-xs font-normal text-muted-foreground">项资源</small></strong>
      </header>
      <section className="mb-6 flex flex-wrap items-center gap-3" aria-label={`${title}筛选`}>
        <ToggleGroup type="single" value={query.sortBy} onValueChange={(value) => value && update({ sortBy: value as "score" | "downloads" | "updatedAt" })} variant="outline" size="sm" aria-label="排序方式" className="max-md:order-1 max-md:w-full">
          {[{ key: "score", label: "精选" }, { key: "downloads", label: "下载量" }, { key: "updatedAt", label: "最近上新" }].map((item) => <ToggleGroupItem key={item.key} value={item.key}>{item.label}</ToggleGroupItem>)}
        </ToggleGroup>
        <label className="relative min-w-[220px] flex-1 max-md:order-2"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">搜索</span><Input className="h-9 pl-9 pr-9" value={query.q ?? ""} onChange={(event) => update({ q: event.target.value || undefined })} placeholder={`搜索${title}`} />{query.q && <Button type="button" variant="ghost" size="icon-xs" className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="清除搜索" onClick={() => update({ q: undefined })}><X size={14} /></Button>}</label>
        {categories.length > 0 && <label className="flex min-w-[150px] items-center gap-2 max-md:order-3"><SlidersHorizontal size={14} className="text-muted-foreground" /><span className="sr-only">分类</span><NativeSelect value={query.category ?? ""} onChange={(event) => update({ category: event.target.value || undefined })} className="min-w-[140px]"><NativeSelectOption value="">全部分类</NativeSelectOption>{categories.map((category) => <NativeSelectOption key={category}>{category}</NativeSelectOption>)}</NativeSelect></label>}
        <ToggleGroup type="single" value={display} onValueChange={(value) => value && onDisplayChange(value as "grid" | "list")} variant="outline" size="sm" aria-label="显示方式" className="max-md:order-4">
          <ToggleGroupItem value="list" aria-label="列表显示"><List size={16} /></ToggleGroupItem><ToggleGroupItem value="grid" aria-label="卡片显示"><Grid2X2 size={16} /></ToggleGroupItem>
        </ToggleGroup>
      </section>
      <section data-testid="resource-state-region" aria-live="polite">
        {pending ? <LoadingState label={`正在加载${title}`} /> : error ? <ErrorState retry={retry} /> : !data?.items.length ? <EmptyState title="没有找到匹配资源" description="尝试更换搜索词或清除筛选条件。" action={hasFilter ? <Button variant="outline" onClick={() => update({ q: undefined, category: undefined, page: 1 })}>清除筛选</Button> : undefined} /> : <div data-view={display} className={display === "grid" ? "grid grid-cols-3 gap-4 max-[1020px]:grid-cols-2 max-md:grid-cols-1" : "divide-y divide-border"}>{data.items.map((resource) => <ResourceCard key={resource.id} resource={resource} compact={display === "list"} />)}</div>}
      </section>
      {data && data.total > data.pageSize && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={(page) => update({ page })} />}
    </main>
  );
}
