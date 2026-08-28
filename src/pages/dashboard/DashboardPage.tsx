import { ArrowUpRight, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState, ResourceBadge, StatusBadge } from "@/components/common";
import { copy, dashboardTypeCards, fallbacks, interpolate, resourceLabels } from "@/apis/static-data";
import { useDashboardQuery, useCurrentActor } from "@/hooks";
import { formatDate } from "@/utils";

export default function DashboardPage() {
  const actor = useCurrentActor();
  const query = useDashboardQuery();
  if (query.isPending) return <LoadingState label={copy.dashboard.loading} />;
  if (query.isError || !query.data) return <ErrorState retry={() => query.refetch()} />;
  const data = query.data;
  return (
    <div className="space-y-5">
      <header className="mb-7 flex items-end justify-between gap-5 max-md:flex-col max-md:items-start">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{copy.dashboard.eyebrow}</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{interpolate(copy.dashboard.greeting, { name: actor.data?.displayName ?? fallbacks.greetingName })}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.dashboard.description}</p>
        </div>
        <Button asChild><Link to="/dashboard/publish">{copy.dashboard.publishNew}<ArrowUpRight size={15} /></Link></Button>
      </header>
      <section className="grid grid-cols-4 gap-3 max-[1020px]:grid-cols-2">
        {dashboardTypeCards.map(({ type, icon: Icon, tone }) => (
          <Card className="grid grid-cols-[42px_1fr] gap-x-2.5 p-4 shadow-none" key={type}>
            <span className={`row-span-2 grid size-[42px] place-items-center rounded-xl ${tone}`}><Icon size={20} /></span>
            <strong className="text-[22px]">{data.counts[type]}</strong>
            <small className="text-xs text-muted-foreground">{interpolate(copy.dashboard.createdCount, { label: resourceLabels[type] })}</small>
          </Card>
        ))}
      </section>
      <Card className="flex-row items-center gap-3 border-violet-200 bg-violet-50 p-4 text-violet-800 shadow-none">
        <Bookmark size={22} className="shrink-0" />
        <div>
          <strong className="text-sm">{interpolate(copy.dashboard.favoritesTitle, { count: data.favoriteCount })}</strong>
          <p className="mt-1 text-xs text-violet-700/70">{copy.dashboard.favoritesDescription}</p>
        </div>
      </Card>
      <Card className="overflow-hidden p-0 shadow-none">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="m-0 text-base font-semibold">{copy.dashboard.recentTitle}</h2>
          <Link className="text-xs font-semibold hover:underline" to="/dashboard/publish">{copy.dashboard.continuePublish}</Link>
        </div>
        <div>
          {data.recent.map((item) => (
            <Link className="grid grid-cols-[minmax(0,1fr)_90px_100px_18px] items-center gap-3 border-b border-border px-5 py-3.5 text-xs last:border-b-0 hover:bg-muted/50 max-md:grid-cols-[1fr_auto]" to={item.href} key={`${item.type}-${item.id}`}>
              <div className="flex min-w-0 items-center gap-2"><ResourceBadge type={item.type} /><strong className="truncate">{item.name}</strong></div>
              <StatusBadge status={item.status} />
              <time className="text-muted-foreground max-md:hidden">{formatDate(item.updatedAt)}</time>
              <ArrowUpRight size={15} className="max-md:hidden" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
