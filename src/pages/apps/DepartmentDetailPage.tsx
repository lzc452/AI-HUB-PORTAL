import { Building2, UserRound } from "lucide-react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ErrorState, LoadingState, ResourceCard } from "@/components/common";
import { copy, interpolate } from "@/apis/static-data";
import { useDepartmentQuery } from "@/hooks";

export default function DepartmentDetailPage() {
  const { departmentId = "" } = useParams();
  const query = useDepartmentQuery(departmentId);
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label={copy.departments.detailLoading} /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} /></main>;
  const detail = query.data;
  const members = detail.members ?? [];
  return (
    <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] space-y-12 py-12 pb-[72px] max-md:w-[calc(100%-28px)] max-md:space-y-9 max-md:py-8">
      <header className="flex items-center gap-5 max-md:items-start">
        <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Building2 size={30} /></div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{copy.departments.detailEyebrow}</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{detail.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{detail.description}</p>
          <small className="mt-2 block text-xs text-muted-foreground">
            {detail.leader ? interpolate(copy.departments.leader, { name: detail.leader }) : ""}
            {detail.memberCount !== undefined ? interpolate(copy.departments.memberCountSuffix, { count: detail.memberCount }) : ""}
            {interpolate(copy.departments.appCount, { count: detail.resourceCount })}
          </small>
        </div>
      </header>
      <section>
        <h2 className="mb-4 text-2xl font-semibold">{copy.departments.appsTitle}</h2>
        {detail.applications.length ? <div className="grid grid-cols-3 gap-4 max-[1020px]:grid-cols-2 max-md:grid-cols-1">{detail.applications.map((app) => <ResourceCard key={app.id} resource={app} />)}</div> : <p className="text-sm text-muted-foreground">{copy.departments.noApps}</p>}
      </section>
      {members.length > 0 && <section>
        <h2 className="mb-4 text-2xl font-semibold">{copy.departments.membersTitle}</h2>
        <div className="grid grid-cols-3 gap-3 max-[1020px]:grid-cols-2 max-md:grid-cols-1">{members.map((member) => <Card className="grid grid-cols-[38px_minmax(0,1fr)] items-center gap-3 p-4 shadow-none" key={member.employeeId}><Avatar className="row-span-2 size-10"><AvatarFallback><UserRound size={18} /></AvatarFallback></Avatar><strong className="text-sm">{member.displayName}</strong><small className="text-xs text-muted-foreground">{member.role}</small></Card>)}</div>
      </section>}
    </main>
  );
}
