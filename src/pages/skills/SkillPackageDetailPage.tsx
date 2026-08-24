import { ArrowDown, PackageOpen } from "lucide-react";
import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceCard } from "@/components/common";
import { useSkillPackageQuery } from "@/hooks";

export default function SkillPackageDetailPage() {
  const { packageSlug = "" } = useParams();
  const query = useSkillPackageQuery(packageSlug);
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载技能包详情" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} /></main>;
  const item = query.data;
  return <main className="portal-page portal-container package-detail-page"><header><span className="package-detail-icon"><PackageOpen size={31} /></span><div><span className="portal-kicker">Skill package</span><h1>{item.name}</h1><p>{item.description}</p><strong>{item.skillCount} 个 Skill · 按推荐顺序执行</strong></div></header><section className="package-sequence">{item.skills.map((skill, index) => <div key={skill.id}><span className="sequence-number">{String(index + 1).padStart(2, "0")}</span><ResourceCard resource={skill} compact />{index < item.skills.length - 1 && <ArrowDown className="sequence-arrow" size={17} />}</div>)}</section></main>;
}
