import { Building2, UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceCard } from "@/components/common";
import { useDepartmentQuery } from "@/hooks";

export default function DepartmentDetailPage() {
  const { departmentId = "" } = useParams();
  const query = useDepartmentQuery(departmentId);
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载部门详情" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} /></main>;
  const detail = query.data;
  return <main className="portal-page portal-container department-detail-page"><header><div className="department-logo department-logo--hero"><Building2 size={30} /></div><div><span className="portal-kicker">Department profile</span><h1>{detail.name}</h1><p>{detail.description}</p><small>负责人：{detail.leader} · {detail.memberCount} 位成员 · {detail.resourceCount} 项资源</small></div></header><section><h2>部门应用</h2>{detail.applications.length ? <div className="resource-grid">{detail.applications.map((app) => <ResourceCard key={app.id} resource={app} />)}</div> : <p className="detail-muted">当前部门暂未发布应用。</p>}</section><section><h2>核心成员</h2><div className="member-grid">{detail.members.map((member) => <div className="member-card portal-card" key={member.employeeId}><span><UserRound size={18} /></span><strong>{member.displayName}</strong><small>{member.role}</small></div>)}</div></section></main>;
}
