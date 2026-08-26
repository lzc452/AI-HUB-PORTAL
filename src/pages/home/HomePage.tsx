import { ArrowLeft, ArrowRight, Building2, PackageOpen, PlugZap, Rocket, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, LoadingState, ResourceCard } from "@/components/common";
import { useHomeQuery } from "@/hooks";
import type { ResourceSummary } from "@/types";

const capabilities = [
  { icon: Rocket, tone: "bg-[#f7f5ff]", eyebrow: "APP HUNT", title: "发现正在改变工作方式的应用", text: "用员工真实投票形成每周榜单，让优秀实践更快进入团队。", href: "/apps-hunt", action: "查看本周榜单" },
  { icon: PlugZap, tone: "bg-[#f5fbf7]", eyebrow: "PLUGIN & MCP", title: "把企业工具带进 AI 工作流", text: "从代码托管、知识库到数据平台，选择经过权限和安全检查的连接能力。", href: "/plugins", action: "浏览连接资源" },
  { icon: Building2, tone: "bg-[#fff9f0]", eyebrow: "DEPARTMENT", title: "跟随部门实践复用成熟能力", text: "了解不同团队发布、维护与推荐的 AI 资源，找到最贴近业务的解法。", href: "/department-zone", action: "进入部门中心" },
] as const;

export default function HomePage() {
  const query = useHomeQuery();
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label="正在准备 AI Hub" /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} /></main>;
  const data = query.data;
  return <main className="overflow-hidden">
    <section className="mx-auto flex min-h-[330px] w-[min(1180px,calc(100%-48px))] flex-col items-start justify-center py-16 pb-11 text-left max-md:w-[calc(100%-28px)] max-md:min-h-0 max-md:py-[52px] max-md:pb-10">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"><Sparkles size={14} />企业 AI 能力门户</span>
      <h1 className="mt-4 max-w-[620px] text-[clamp(36px,3.4vw,48px)] font-semibold leading-tight tracking-[-0.05em]">把好用的 AI 能力，<br />带到每个人的工作中</h1>
      <p className="mt-3 max-w-[630px] text-[15px] leading-relaxed text-muted-foreground">发现、评估、收藏并发布可信的 App、Skill、Plugin 与 MCP。所有资源都来自企业内部审核与安全体系。</p>
      <div className="mt-7 flex gap-2.5 max-md:w-full max-md:flex-col"><Button asChild className="rounded-full px-4"><Link to="/apps?sortBy=score">探索全部资源<ArrowRight size={16} /></Link></Button><Button asChild variant="outline" className="rounded-full px-4"><Link to="/tutorials">阅读使用指南</Link></Button></div>
      <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} />统一安全扫描</span><span className="inline-flex items-center gap-1.5"><WandSparkles size={15} />网页端发布</span><span className="inline-flex items-center gap-1.5"><Building2 size={15} />企业 SSO 与权限</span></div>
    </section>
    <CapabilityRail />
    <Featured title="热门应用" description="员工正在高频使用的 AI 应用" href="/apps?sortBy=score" resources={data.apps} />
    <section className="mx-auto my-[74px] grid w-[min(1180px,calc(100%-48px))] grid-cols-[0.9fr_1.1fr] items-center gap-[78px] rounded-[26px] bg-zinc-900 p-16 text-white max-[900px]:grid-cols-1 max-[900px]:gap-9 max-md:w-[calc(100%-28px)] max-md:my-11 max-md:p-8 max-md:px-5">
      <div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-400">Build your workflow</span><h2 className="mt-2 text-[clamp(27px,3.5vw,40px)] font-semibold leading-tight tracking-[-0.04em]">从一个 Skill 开始，形成你的 AI 工作方式</h2><p className="mt-3 leading-relaxed text-zinc-400">Skills 把可靠的方法、约束和参考资料封装为可复用能力；SkillPackage 则按真实任务将多个 Skills 组织为完整工作流。</p><div className="mt-7 flex gap-2 max-md:flex-col"><Button asChild variant="secondary" className="rounded-full bg-white text-zinc-900 hover:bg-zinc-100"><Link to="/skills">浏览技能</Link></Button><Button asChild variant="outline" className="rounded-full border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"><Link to="/skillpackage"><PackageOpen size={15} />查看技能包</Link></Button></div></div>
      <div className="overflow-hidden rounded-2xl bg-white p-1 text-foreground">{data.skills.slice(0, 3).map((resource) => <ResourceCard key={resource.id} resource={resource} compact />)}</div>
    </section>
    <Featured title="连接你的企业资源" description="受控、透明、可审计的 Plugin 与 MCP" href="/plugins" resources={[...data.plugins, ...data.mcps]} />
    <section className="mx-auto w-[min(1180px,calc(100%-48px))] py-20 max-md:w-[calc(100%-28px)] max-md:py-[52px]"><div className="mb-7 flex items-end justify-between gap-6 max-md:items-start"><div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Department zone</span><h2 className="mt-2 text-[clamp(27px,3.5vw,40px)] font-semibold tracking-[-0.04em]">部门实践中心</h2><p className="mt-1 text-sm text-muted-foreground">从业务团队的真实使用经验中发现更合适的资源。</p></div><Link className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold" to="/department-zone">查看全部<ArrowRight size={15} /></Link></div><div className="grid grid-cols-4 gap-3.5 max-[1020px]:grid-cols-2 max-md:grid-cols-1">{data.departments.slice(0, 4).map((department) => <Link key={department.departmentId} to={`/department/${department.departmentId}`}><Card className="h-full gap-3 rounded-xl p-5 shadow-none transition hover:-translate-y-0.5 hover:shadow-lg"><div className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Building2 size={22} /></div><h3 className="m-0 text-base font-semibold">{department.name}</h3><p className="m-0 text-sm leading-relaxed text-muted-foreground">{department.description}</p><div className="mt-auto flex flex-wrap gap-3 text-xs text-muted-foreground"><span>{department.memberCount} 位成员</span><span>{department.resourceCount} 项资源</span></div></Card></Link>)}</div></section>
    {data.updates && <section className="mx-auto mb-16 flex w-[min(1180px,calc(100%-48px))] items-center justify-between gap-5 rounded-2xl border border-border bg-muted p-6 max-md:w-[calc(100%-28px)] max-md:flex-col max-md:items-start"><div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Latest update · {new Date(data.updates.updatedAt).toLocaleDateString("zh-CN")}</span><h2 className="mt-2 text-xl font-semibold">{data.updates.title}</h2><p className="mt-1 text-sm text-muted-foreground">{data.updates.summary}</p></div><Button asChild variant="outline" className="rounded-full"><Link to="/updates">查看更新日志<ArrowRight size={15} /></Link></Button></section>}
  </main>;
}

function CapabilityRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => railRef.current?.scrollBy({ left: direction === "left" ? -360 : 360, behavior: "smooth" });
  return <section className="mx-auto w-[min(1180px,calc(100%-48px))] pb-20 max-md:w-[calc(100%-28px)] max-md:pb-14"><header className="mb-5 flex items-end justify-between gap-6 max-md:items-start"><div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Explore the portal</span><h2 className="mt-2 text-[clamp(24px,3vw,34px)] font-semibold tracking-[-0.04em]">从发现到复用，找到适合你的 AI 能力</h2></div><div className="flex gap-1"><Button variant="ghost" size="icon" className="rounded-full" aria-label="查看上一组能力" onClick={() => scroll("left")}><ArrowLeft size={16} /></Button><Button variant="ghost" size="icon" className="rounded-full" aria-label="查看下一组能力" onClick={() => scroll("right")}><ArrowRight size={16} /></Button></div></header><div ref={railRef} className="flex snap-x gap-3.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{capabilities.map(({ icon: Icon, tone, ...item }) => <Link className={`group relative min-h-[280px] min-w-[min(420px,36vw)] snap-start overflow-hidden rounded-2xl border border-border p-6 transition hover:-translate-y-1 hover:shadow-lg max-[900px]:min-w-[70vw] max-md:min-h-[310px] max-md:p-6 ${tone}`} to={item.href} key={item.title}><div className="grid size-[52px] place-items-center rounded-2xl bg-white/70"><Icon size={25} /></div><span className="mt-9 block text-[11px] font-bold tracking-[0.1em]">{item.eyebrow}</span><h2 className="mt-2 max-w-[330px] text-[22px] font-semibold leading-tight tracking-[-0.035em]">{item.title}</h2><p className="mt-2 max-w-[330px] text-sm leading-relaxed text-foreground/65">{item.text}</p><strong className="absolute bottom-5 inline-flex items-center gap-2 text-[13px]">{item.action}<ArrowRight size={15} /></strong></Link>)}</div></section>;
}

function Featured({ title, description, href, resources }: { title: string; description: string; href: string; resources: ResourceSummary[] }) {
  return <section className="mx-auto w-[min(1180px,calc(100%-48px))] border-t border-border py-20 max-md:w-[calc(100%-28px)] max-md:py-[52px]"><div className="mb-7 flex items-end justify-between gap-6 max-md:items-start"><div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Curated resources</span><h2 className="mt-2 text-[clamp(27px,3.5vw,40px)] font-semibold tracking-[-0.04em]">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><Link className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold" to={href}>查看全部<ArrowRight size={15} /></Link></div><div className="grid grid-cols-4 gap-4 max-[1020px]:grid-cols-2 max-md:grid-cols-1">{resources.slice(0, 4).map((resource) => <ResourceCard className="min-h-[210px] flex-col" key={`${resource.type}-${resource.id}`} resource={resource} />)}</div></section>;
}
