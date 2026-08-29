import { Clock3, Crown, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorState, LoadingState } from "@/components/common";
import { copy, interpolate } from "@/apis/static-data";
import { useAppsHuntQuery, useHuntVoteMutation, useRequireLogin } from "@/hooks";
import { appHuntMedal, formatCompactNumber, initials } from "@/utils";

export default function AppsHuntPage() {
  const query = useAppsHuntQuery();
  const vote = useHuntVoteMutation();
  const requireLogin = useRequireLogin();
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label={copy.hunt.loading} /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} /></main>;
  const data = query.data;
  return (
    <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 pb-[72px] max-md:w-[calc(100%-28px)] max-md:py-8">
      <Card className="mb-8 flex-row items-center gap-5 rounded-[22px] bg-[#f3f1ff] p-9 shadow-none max-md:flex-col max-md:items-start max-md:p-6">
        <span className="grid size-14 place-items-center rounded-2xl bg-white text-violet-600"><Crown size={26} /></span>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{copy.hunt.eyebrow}</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{data.periodName}</h1>
          {data.description && <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>}
          {data.closesAt ? <small className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 size={14} />{interpolate(copy.hunt.deadline, { date: new Date(data.closesAt).toLocaleString("zh-CN") })}</small> : <small className="mt-3 block text-xs text-muted-foreground">{interpolate(copy.hunt.activityStatus, { status: data.periodStatus === "active" ? copy.hunt.voting : copy.hunt.ended })}</small>}
        </div>
      </Card>
      <Card className="overflow-hidden p-0 shadow-none">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 text-sm"><div className="flex items-center gap-2"><Trophy size={19} /><strong>{copy.hunt.leaderboard}</strong></div><span className="text-xs text-muted-foreground max-md:hidden">{copy.hunt.voteRecorded}</span></header>
        {data.entries.map((entry) => {
          const hasVoted = entry.hasVoted || (vote.isSuccess && vote.variables?.entryId === entry.entryId);
          return <article className="grid grid-cols-[28px_42px_minmax(0,1fr)_70px_auto] items-center gap-3 border-b border-border px-5 py-4 last:border-b-0 max-md:grid-cols-[28px_42px_minmax(0,1fr)] max-md:gap-2 max-md:px-3" key={entry.entryId}>
            <strong className="text-lg text-muted-foreground">{entry.rank}</strong>
            <Avatar className="size-10 rounded-xl"><AvatarImage src={entry.app.iconUrl ?? undefined} alt="" /><AvatarFallback className="rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">{initials(entry.app.name)}</AvatarFallback></Avatar>
            <div className="min-w-0"><div className="flex items-center gap-2"><strong className="truncate text-sm">{entry.app.name}</strong><span className="text-xs text-muted-foreground">{appHuntMedal(entry)}</span></div><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{entry.app.description}</p></div>
            <div className="text-right max-md:col-start-2 max-md:row-start-2 max-md:flex max-md:items-baseline max-md:gap-1 max-md:text-left"><strong>{formatCompactNumber(entry.votes)}</strong><span className="ml-1 text-xs text-muted-foreground">{copy.hunt.voteCount}</span></div>
            <Button size="sm" variant={hasVoted ? "secondary" : "outline"} className="max-md:col-start-3 max-md:row-start-2 max-md:justify-self-end" disabled={vote.isPending || hasVoted || data.periodStatus !== "active"} onClick={() => requireLogin(() => vote.mutate({ periodId: data.periodId, entryId: entry.entryId }, { onSuccess: () => toast.success(copy.hunt.votedToast), onError: () => toast.error(copy.hunt.voteFailedToast) }))}>{hasVoted ? copy.hunt.voted : copy.hunt.vote}</Button>
          </article>;
        })}
      </Card>
      {data.history.length > 0 && <section className="mt-8"><h2 className="text-xl font-semibold">{copy.hunt.historyTitle}</h2><div className="mt-3 grid gap-2">{data.history.map((item) => <div className="flex items-center justify-between border-b border-border py-3 text-sm" key={item.periodId}><span className="text-muted-foreground">{item.periodName}</span><strong>{item.winnerName}</strong></div>)}</div></section>}
    </main>
  );
}
