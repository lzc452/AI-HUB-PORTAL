import { ArrowDown, PackageOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ErrorState, LoadingState } from "@/components/common";
import { Card } from "@/components/ui/card";
import { useSkillPackageQuery } from "@/hooks";

export default function SkillPackageDetailPage() {
  const { packageSlug = "" } = useParams();
  const query = useSkillPackageQuery(packageSlug);
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label="正在加载技能包详情" /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} /></main>;
  const item = query.data;
  return (
    <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 pb-[72px] max-md:w-[calc(100%-28px)] max-md:py-8">
      <header className="mb-10 flex items-center gap-5 rounded-[22px] bg-violet-50 p-9 max-md:flex-col max-md:items-start max-md:p-6">
        <span className="grid size-16 place-items-center rounded-2xl bg-white text-violet-600"><PackageOpen size={31} /></span>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Skill package</span>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{item.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          <strong className="mt-2 block text-xs">{item.skillCount} 个 Skill · 按推荐顺序执行</strong>
        </div>
      </header>
      <section className="mx-auto max-w-3xl">
        {item.skills.map((skill, index) => <div className="relative mb-7 grid grid-cols-[50px_minmax(0,1fr)] items-center gap-3 max-md:grid-cols-[38px_minmax(0,1fr)] max-md:gap-2" key={skill.id}>
          <span className="text-2xl font-bold text-muted-foreground/60">{String(index + 1).padStart(2, "0")}</span>
          <Link to={skill.href}><Card className="gap-2 p-5 shadow-none transition hover:bg-muted/40"><strong>{skill.name}</strong><p className="text-sm text-muted-foreground">{skill.description}</p></Card></Link>
          {index < item.skills.length - 1 && <ArrowDown className="absolute -bottom-6 left-4 text-muted-foreground/50" size={17} />}
        </div>)}
      </section>
    </main>
  );
}
