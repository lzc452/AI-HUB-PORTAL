import { ArrowRight, Layers3, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/components/common";
import { useSkillPackagesQuery } from "@/hooks";
import { formatDate } from "@/utils";

const tones = ["bg-emerald-50", "bg-orange-50", "bg-indigo-50"];

export default function SkillPackagesPage() {
  const query = useSkillPackagesQuery();
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label="正在加载技能包" /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} /></main>;
  return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 pb-[72px] max-md:w-[calc(100%-28px)] max-md:py-8"><header className="mb-10 flex items-center gap-5 rounded-[22px] bg-violet-50 p-9 max-md:flex-col max-md:items-start max-md:p-6"><span className="grid size-16 place-items-center rounded-2xl bg-white text-violet-600"><PackageOpen size={26} /></span><div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Skill Packages</span><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">为完整任务准备的技能包</h1><p className="mt-1 text-sm text-muted-foreground">按照真实工作顺序组合多个 Skill，快速获得一套经过验证的方法与工具。</p></div></header><div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-md:grid-cols-1">{query.data.map((item, index) => <Link key={item.id} to={`/skillpackage/${item.slug}`}><Card className={`min-h-80 h-full gap-4 rounded-2xl p-6 shadow-none transition hover:-translate-y-1 ${tones[index % tones.length]}`}><span className="grid size-12 place-items-center rounded-xl bg-white/70"><Layers3 size={22} /></span><h2 className="mt-3 text-[22px] font-semibold">{item.name}</h2><p className="text-sm leading-relaxed text-foreground/65">{item.description}</p><div className="mt-auto flex gap-3 text-xs text-muted-foreground"><span>{item.skillCount} 个 Skill</span><span>更新于 {formatDate(item.updatedAt)}</span></div><strong className="inline-flex items-center gap-1.5 text-sm">查看技能包<ArrowRight size={15} /></strong></Card></Link>)}</div></main>;
}
