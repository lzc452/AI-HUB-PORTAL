import { Clock3, Crown, Trophy } from "lucide-react";
import { ErrorState, LoadingState } from "@/components/common";
import { useAppsHuntQuery, useHuntVoteMutation } from "@/hooks";
import { appHuntMedal, formatCompactNumber, initials } from "@/utils";
import { useUiStore } from "@/store";

export default function AppsHuntPage() {
  const query = useAppsHuntQuery();
  const vote = useHuntVoteMutation();
  const toast = useUiStore((state) => state.showToast);
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载应用猎手榜单" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} /></main>;
  const data = query.data;
  return <main className="portal-page portal-container hunt-page"><header className="hunt-hero"><span className="hunt-crown"><Crown size={26} /></span><div><span className="portal-kicker">AI Hub App Hunt</span><h1>{data.periodName}</h1><p>{data.description}</p><small><Clock3 size={14} />本期投票截止 {new Date(data.closesAt).toLocaleString("zh-CN")}</small></div></header><section className="hunt-board portal-card"><header><div><Trophy size={19} /><strong>实时榜单</strong></div><span>每位员工对同一应用保留一张有效票</span></header>{data.entries.map((entry) => <article className={`hunt-entry hunt-entry--${entry.rank}`} key={entry.entryId}><strong className="hunt-rank">{entry.rank}</strong><div className="resource-card__icon">{entry.app.iconUrl ? <img src={entry.app.iconUrl} alt="" /> : initials(entry.app.name)}</div><div className="hunt-entry__body"><div><strong>{entry.app.name}</strong><span>{appHuntMedal(entry)}</span></div><p>{entry.app.description}</p></div><div className="hunt-votes"><strong>{formatCompactNumber(entry.votes)}</strong><span>票</span></div><button className={`portal-button${entry.hasVoted ? " is-selected" : ""}`} disabled={vote.isPending || entry.hasVoted} onClick={() => vote.mutate({ periodId: data.periodId, entryId: entry.entryId }, { onSuccess: () => toast("投票已记录", "success"), onError: () => toast("投票失败，请重试", "error") })}>{entry.hasVoted ? "已投票" : "投一票"}</button></article>)}</section><section className="hunt-history"><h2>历史优胜应用</h2>{data.history.map((item) => <div key={item.periodId}><span>{item.periodName}</span><strong>{item.winnerName}</strong></div>)}</section></main>;
}
