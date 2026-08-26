import { Building2, Search, UsersRound } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, ErrorState, LoadingState } from "@/components/common";
import { useDepartmentsQuery } from "@/hooks";

export default function DepartmentZonePage() {
  const [params, setParams] = useSearchParams();
  const query = useDepartmentsQuery();
  const keyword = params.get("q") ?? "";
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label="正在加载部门中心" /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} /></main>;
  const departments = query.data.filter((item) => `${item.name}${item.description}`.toLowerCase().includes(keyword.toLowerCase()));
  return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 pb-[72px] max-md:w-[calc(100%-28px)] max-md:py-8"><header className="mb-10 max-w-3xl rounded-[22px] bg-indigo-50 p-9 max-md:p-6"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Department zone</span><h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">部门中心</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">了解各团队正在建设和推荐的 AI 能力，从真实业务实践中找到可复用方案。</p><label className="relative mt-6 block max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="bg-white pl-9" value={keyword} onChange={(event) => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} placeholder="搜索部门" /></label></header>{departments.length ? <div className="grid grid-cols-3 gap-4 max-[1020px]:grid-cols-2 max-md:grid-cols-1">{departments.map((department) => <Link to={`/department/${department.departmentId}`} key={department.departmentId}><Card className="h-full gap-3 rounded-xl p-5 shadow-none transition hover:-translate-y-0.5 hover:shadow-lg"><div className="grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Building2 size={23} /></div><h2 className="m-0 text-lg font-semibold">{department.name}</h2><p className="m-0 text-sm leading-relaxed text-muted-foreground">{department.description}</p><div className="mt-auto flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><UsersRound size={13} />{department.memberCount} 位成员</span><span>{department.resourceCount} 项资源</span></div></Card></Link>)}</div> : <EmptyState title="没有找到部门" description="请尝试使用部门全称或更短的关键词。" />}</main>;
}
