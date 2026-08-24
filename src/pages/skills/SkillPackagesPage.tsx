import { ArrowRight, Layers3, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorState, LoadingState } from "@/components/common";
import { useSkillPackagesQuery } from "@/hooks";
import { formatDate } from "@/utils";

export default function SkillPackagesPage() {
  const query = useSkillPackagesQuery();
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载技能包" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} /></main>;
  return <main className="portal-page portal-container package-page"><header className="package-hero"><span><PackageOpen size={26} /></span><div><span className="portal-kicker">Skill Packages</span><h1>为完整任务准备的技能包</h1><p>按照真实工作顺序组合多个 Skill，快速获得一套经过验证的方法与工具。</p></div></header><div className="package-grid">{query.data.map((item, index) => <Link className={`package-card package-card--${index + 1}`} key={item.id} to={`/skillpackage/${item.slug}`}><span className="package-card__icon"><Layers3 size={22} /></span><h2>{item.name}</h2><p>{item.description}</p><div><span>{item.skillCount} 个 Skill</span><span>更新于 {formatDate(item.updatedAt)}</span></div><strong>查看技能包<ArrowRight size={15} /></strong></Link>)}</div></main>;
}
