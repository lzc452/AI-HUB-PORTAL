import { Building2, Search, UsersRound } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { EmptyState, ErrorState, LoadingState } from "@/components/common";
import { useDepartmentsQuery } from "@/hooks";

export default function DepartmentZonePage() {
  const [params, setParams] = useSearchParams();
  const query = useDepartmentsQuery();
  const keyword = params.get("q") ?? "";
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载部门中心" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} /></main>;
  const departments = query.data.filter((item) => `${item.name}${item.description}`.toLowerCase().includes(keyword.toLowerCase()));
  return <main className="portal-page portal-container department-page"><header className="department-hero"><span className="portal-kicker">Department zone</span><h1>部门中心</h1><p>了解各团队正在建设和推荐的 AI 能力，从真实业务实践中找到可复用方案。</p><label className="department-search"><Search size={17} /><input value={keyword} onChange={(event) => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })} placeholder="搜索部门" /></label></header>{departments.length ? <div className="department-grid department-grid--large">{departments.map((department) => <Link className="department-card portal-card" to={`/department/${department.departmentId}`} key={department.departmentId}><div className="department-logo"><Building2 size={23} /></div><h2>{department.name}</h2><p>{department.description}</p><div><span><UsersRound size={13} />{department.memberCount} 位成员</span><span>{department.resourceCount} 项资源</span></div></Link>)}</div> : <EmptyState title="没有找到部门" description="请尝试使用部门全称或更短的关键词。" />}</main>;
}
