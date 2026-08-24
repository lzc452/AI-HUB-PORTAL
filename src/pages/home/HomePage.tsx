import { ArrowLeft, ArrowRight, Building2, PackageOpen, PlugZap, Rocket, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { ErrorState, LoadingState, ResourceCard } from "@/components/common";
import { useHomeQuery } from "@/hooks";
import type { ResourceSummary } from "@/types";

const capabilities = [
  { icon: Rocket, eyebrow: "APP HUNT", title: "发现正在改变工作方式的应用", text: "用员工真实投票形成每周榜单，让优秀实践更快进入团队。", href: "/apps-hunt", action: "查看本周榜单" },
  { icon: PlugZap, eyebrow: "PLUGIN & MCP", title: "把企业工具带进 AI 工作流", text: "从代码托管、知识库到数据平台，选择经过权限和安全检查的连接能力。", href: "/plugins", action: "浏览连接资源" },
  { icon: Building2, eyebrow: "DEPARTMENT", title: "跟随部门实践复用成熟能力", text: "了解不同团队发布、维护与推荐的 AI 资源，找到最贴近业务的解法。", href: "/department-zone", action: "进入部门中心" },
];

export default function HomePage() {
  const query = useHomeQuery();
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在准备 AI Hub" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} /></main>;
  const data = query.data;
  return <main className="home-page">
    <section className="home-hero portal-container"><span className="home-eyebrow"><Sparkles size={14} />企业 AI 能力门户</span><h1>把好用的 AI 能力，<br />带到每个人的工作中</h1><p>发现、评估、收藏并发布可信的 App、Skill、Plugin 与 MCP。所有资源都来自企业内部审核与安全体系。</p><div className="home-hero-actions"><Link className="portal-button portal-button--primary" to="/apps?sortBy=score">探索全部资源<ArrowRight size={16} /></Link><Link className="portal-button" to="/tutorials">阅读使用指南</Link></div><div className="home-trust"><span><ShieldCheck size={15} />统一安全扫描</span><span><WandSparkles size={15} />网页端发布</span><span><Building2 size={15} />企业 SSO 与权限</span></div></section>
    <CapabilityRail />
    <Featured title="热门应用" description="员工正在高频使用的 AI 应用" href="/apps?sortBy=score" resources={data.apps} />
    <section className="home-feature-split portal-container"><div><span className="portal-kicker">Build your workflow</span><h2>从一个 Skill 开始，形成你的 AI 工作方式</h2><p>Skills 把可靠的方法、约束和参考资料封装为可复用能力；SkillPackage 则按真实任务将多个 Skills 组织为完整工作流。</p><div className="home-inline-links"><Link className="portal-button portal-button--primary" to="/skills">浏览技能</Link><Link className="portal-button" to="/skillpackage"><PackageOpen size={15} />查看技能包</Link></div></div><div className="home-feature-list">{data.skills.slice(0, 3).map((resource) => <ResourceCard key={resource.id} resource={resource} compact />)}</div></section>
    <Featured title="连接你的企业资源" description="受控、透明、可审计的 Plugin 与 MCP" href="/plugins" resources={[...data.plugins, ...data.mcps]} />
    <section className="home-departments portal-container"><div className="section-heading"><div><span className="portal-kicker">Department zone</span><h2>部门实践中心</h2><p>从业务团队的真实使用经验中发现更合适的资源。</p></div><Link to="/department-zone">查看全部<ArrowRight size={15} /></Link></div><div className="department-grid">{data.departments.slice(0, 4).map((department) => <Link className="department-card portal-card" key={department.departmentId} to={`/department/${department.departmentId}`}><div className="department-logo"><Building2 size={22} /></div><h3>{department.name}</h3><p>{department.description}</p><div><span>{department.memberCount} 位成员</span><span>{department.resourceCount} 项资源</span></div></Link>)}</div></section>
    {data.updates && <section className="home-update portal-container"><div><span className="portal-kicker">Latest update · {new Date(data.updates.updatedAt).toLocaleDateString("zh-CN")}</span><h2>{data.updates.title}</h2><p>{data.updates.summary}</p></div><Link className="portal-button" to="/updates">查看更新日志<ArrowRight size={15} /></Link></section>}
  </main>;
}

function CapabilityRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: "left" | "right") => railRef.current?.scrollBy({ left: direction === "left" ? -360 : 360, behavior: "smooth" });
  return <section className="home-capability-section portal-container"><header className="home-capability-heading"><div><span className="portal-kicker">Explore the portal</span><h2>从发现到复用，找到适合你的 AI 能力</h2></div><div className="home-capability-controls"><button className="portal-icon-button" aria-label="查看上一组能力" onClick={() => scroll("left")}><ArrowLeft size={16} /></button><button className="portal-icon-button" aria-label="查看下一组能力" onClick={() => scroll("right")}><ArrowRight size={16} /></button></div></header><div className="home-capabilities" ref={railRef}>{capabilities.map(({ icon: Icon, ...item }, index) => <Link className={`home-capability home-capability--${index + 1}`} to={item.href} key={item.title}><div className="home-capability-icon"><Icon size={25} /></div><span>{item.eyebrow}</span><h2>{item.title}</h2><p>{item.text}</p><strong>{item.action}<ArrowRight size={15} /></strong></Link>)}</div></section>;
}

function Featured({ title, description, href, resources }: { title: string; description: string; href: string; resources: ResourceSummary[] }) {
  return <section className="home-featured portal-container"><div className="section-heading"><div><span className="portal-kicker">Curated resources</span><h2>{title}</h2><p>{description}</p></div><Link to={href}>查看全部<ArrowRight size={15} /></Link></div><div className="resource-grid">{resources.slice(0, 4).map((resource) => <ResourceCard key={`${resource.type}-${resource.id}`} resource={resource} />)}</div></section>;
}
