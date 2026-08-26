import { CheckCircle2, Download, ExternalLink, File, Heart, MessageCircle, Reply, ShieldCheck, Star } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import type { AppDetail, McpDetail, PluginDetail, ResourceDetail, SkillDetail } from "@/types";
import { useCreateComment, useFavoriteMutation, useResourceComments } from "@/hooks";
import { formatCompactNumber, formatDate, initials, resourceLabel } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DetailTabs } from "@/components/common/DetailTabs";
import { EmptyState, ErrorState, LoadingState } from "@/components/common/StatePanel";
import { MarkdownContent } from "@/components/common/MarkdownContent";
import { ResourceBadge, StatusBadge } from "@/components/common/ResourceBadge";
import { ResourceCodeViewer } from "@/components/common/ResourceCodeViewer";

const baseTabs = [
  { key: "overview", label: "概述" },
  { key: "versions", label: "版本与文件" },
  { key: "install", label: "安装与使用" },
  { key: "comments", label: "评论" },
  { key: "security", label: "安全报告" },
];

export function ResourceDetailView({ detail }: { detail: ResourceDetail }) {
  const [params, setParams] = useSearchParams();
  const tabs = detail.files?.length ? [...baseTabs.slice(0, 2), { key: "code", label: "代码" }, ...baseTabs.slice(2)] : baseTabs;
  const requestedTab = params.get("tab") ?? "overview";
  const active = tabs.some((tab) => tab.key === requestedTab) ? requestedTab : "overview";
  const favorite = useFavoriteMutation(detail.type, detail.id);
  const changeTab = (tab: string) => setParams((current) => { if (tab === "overview") current.delete("tab"); else current.set("tab", tab); return current; }, { replace: true });
  const toggleFavorite = () => favorite.mutate(!detail.isStarred, { onSuccess: (_, activeValue) => activeValue ? toast.success("已加入收藏") : toast.success("已取消收藏"), onError: () => toast.error("收藏状态更新失败") });
  const resourcePath = detail.type === "app" ? "/apps?sortBy=score" : detail.type === "skill" ? "/skills" : detail.type === "plugin" ? "/plugins" : "/mcp";

  return (
    <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 pb-[72px] max-md:w-[calc(100%-28px)] max-md:py-8 max-md:pb-14">
      <Breadcrumb className="mb-5"><BreadcrumbList><BreadcrumbItem><BreadcrumbLink asChild><Link to={resourcePath}>{resourceLabel(detail.type)}</Link></BreadcrumbLink></BreadcrumbItem><BreadcrumbSeparator /><BreadcrumbItem><BreadcrumbPage>{detail.name}</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
      <section className="flex items-start gap-5 py-3 max-md:flex-wrap">
        <Avatar className="size-20 shrink-0 rounded-2xl border border-border bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700 max-md:size-16">
          <AvatarImage src={detail.iconUrl ?? undefined} alt="" />
          <AvatarFallback className="rounded-2xl bg-transparent text-xl font-extrabold text-indigo-700">{initials(detail.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 max-md:flex-col max-md:items-start"><h1 className="m-0 text-[clamp(28px,4vw,44px)] font-semibold tracking-[-0.04em]">{detail.name}</h1><ResourceBadge type={detail.type} /></div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{detail.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span>由 {detail.owner.displayName} 发布</span><span className="inline-flex items-center gap-1"><Star size={14} />{formatCompactNumber(detail.stars)}</span><span className="inline-flex items-center gap-1"><Download size={14} />{formatCompactNumber(detail.downloads)}</span></div>
          <div className="mt-3 flex flex-wrap gap-2">{detail.tags.map((tag) => <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground" key={tag}>{tag}</span>)}</div>
        </div>
        <Button variant={detail.isStarred ? "default" : "outline"} className="shrink-0 max-md:w-full" disabled={favorite.isPending} onClick={toggleFavorite}><Heart size={16} fill={detail.isStarred ? "currentColor" : "none"} />{detail.isStarred ? "已收藏" : "收藏"}</Button>
      </section>
      <Tabs value={active} onValueChange={changeTab} className="mt-5 w-full">
        <DetailTabs tabs={tabs} />
        <div className="mt-7 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-8 max-[900px]:flex max-[900px]:flex-col">
          <section className="min-w-0">
            {active === "overview" && <Overview detail={detail} />}
            {active === "versions" && <Versions detail={detail} />}
            {active === "code" && detail.files && <ResourceCodeViewer files={detail.files} />}
            {active === "install" && <Install detail={detail} />}
            {active === "comments" && <Comments detail={detail} />}
            {active === "security" && <Security detail={detail} />}
          </section>
          <Card className="sticky top-[86px] gap-4 p-5 shadow-none max-[900px]:static max-[900px]:order-[-1] max-[900px]:w-full">
            <strong>开始使用</strong><p className="m-0 text-sm text-muted-foreground">当前稳定版本 <b className="text-foreground">v{detail.version}</b></p>
            <Button className="w-full"><ExternalLink size={15} />{detail.type === "app" ? "打开应用" : "查看安装方式"}</Button>
            <dl className="m-0 grid gap-4 border-t border-border pt-4 text-xs"><div><dt className="text-muted-foreground">兼容环境</dt><dd className="mt-1 font-semibold">{detail.compatibility.join(" · ")}</dd></div><div><dt className="text-muted-foreground">安全状态</dt><dd className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-600"><CheckCircle2 size={14} />扫描通过</dd></div><div><dt className="text-muted-foreground">最近更新</dt><dd className="mt-1 font-semibold">{formatDate(detail.updatedAt)}</dd></div></dl>
          </Card>
        </div>
      </Tabs>
    </main>
  );
}

function Overview({ detail }: { detail: ResourceDetail }) {
  return <article className="space-y-8 text-[15px] leading-relaxed text-muted-foreground"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Overview</span><MarkdownContent markdown={detail.overview} /><div><h3 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">能力标签</h3><div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">{detail.tags.map((tag) => <div className="flex flex-col gap-2 rounded-xl border border-border p-4" key={tag}><ShieldCheck className="size-[18px] text-emerald-600" /><strong className="text-sm text-foreground">{tag}</strong><span className="text-xs text-muted-foreground">已在企业环境完成能力验证</span></div>)}</div></div></article>;
}

function Versions({ detail }: { detail: ResourceDetail }) {
  const rootFiles = detail.files ?? [];
  return <div className="space-y-4 text-muted-foreground"><h2 className="m-0 text-2xl font-semibold tracking-tight text-foreground">版本与文件</h2><Card className="flex-row items-center justify-between gap-4 p-4 shadow-none"><div className="flex flex-col gap-1"><strong className="text-foreground">v{detail.version}</strong><span className="text-xs">当前稳定版本 · {formatDate(detail.updatedAt)}</span></div><StatusBadge status="published" /></Card>{rootFiles.map((file) => <div className="flex items-center gap-3 border-b border-border py-3 text-sm" key={file.path}><File size={17} /><span className="text-foreground">{file.name}</span><small className="ml-auto">{file.type === "directory" ? `${file.children?.length ?? 0} 项` : `${file.size ?? 0} B`}</small></div>)}<p className="m-0 text-xs">完整版本资产已通过安全扫描，可在“代码”中只读查看已授权文件。</p></div>;
}

function Install({ detail }: { detail: ResourceDetail }) {
  let command = `在 AI Hub 中打开 ${detail.name}`;
  if (detail.type === "skill") command = (detail as SkillDetail).installCommand;
  if (detail.type === "plugin") command = (detail as PluginDetail).installCommand;
  if (detail.type === "mcp") command = (detail as McpDetail).configTemplate;
  const app = detail.type === "app" ? detail as AppDetail : null;
  return <div className="space-y-5 text-sm leading-relaxed text-muted-foreground"><h2 className="m-0 text-2xl font-semibold tracking-tight text-foreground">{detail.type === "app" ? "交付与使用" : "安装配置"}</h2><p className="m-0">按照企业授权策略使用当前资源，首次访问可能需要确认权限范围。</p><pre className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-100"><code>{command}</code></pre>{app && <div className="flex flex-wrap gap-2">{app.deliveryTypes.map((type) => <span className="rounded-full bg-muted px-2.5 py-1 text-xs" key={type}>{type}</span>)}</div>}{detail.type === "mcp" && <p className="m-0 text-xs">认证方式：{(detail as McpDetail).authentication}</p>}</div>;
}

function Comments({ detail }: { detail: ResourceDetail }) {
  const query = useResourceComments(detail.type, detail.id);
  const create = useCreateComment(detail.type, detail.id);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const submit = (event: FormEvent) => { event.preventDefault(); const value = body.trim(); if (!value) return; create.mutate({ body: value, parentCommentId: replyTo }, { onSuccess: () => { setBody(""); setReplyTo(null); } }); };
  useEffect(() => { if (query.data && window.location.hash.startsWith("#comment-")) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [query.data]);
  return <div className="space-y-6"><h2 className="m-0 text-2xl font-semibold tracking-tight">评论与交流</h2><form className="space-y-3" onSubmit={submit}>{replyTo && <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">正在回复一条评论<Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(null)}>取消</Button></div>}<Textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="分享你的使用体验或建议" className="min-h-28 resize-y" /><div className="flex items-center justify-between gap-3"><small className="text-xs text-muted-foreground">{body.length} / 4000</small><Button disabled={create.isPending || !body.trim()}><MessageCircle size={15} />发表评论</Button></div></form>{query.isPending ? <LoadingState /> : query.isError ? <ErrorState retry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title="还没有评论" description="成为第一个分享使用体验的人。" /> : <div className="overflow-hidden rounded-xl border border-border">{query.data.map((comment) => <article className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 border-b border-border p-4 last:border-b-0" id={`comment-${comment.commentId}`} key={comment.commentId}><Avatar className="size-9"><AvatarFallback>{initials(comment.author.displayName)}</AvatarFallback></Avatar><div><header className="flex items-center justify-between gap-3 max-md:flex-col max-md:items-start"><strong className="text-sm">{comment.author.displayName}</strong><time className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</time></header><p className="my-2 text-sm leading-relaxed text-muted-foreground">{comment.body}</p><Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setReplyTo(comment.commentId)}><Reply size={13} />回复</Button>{comment.replies.map((reply) => <div className="mt-3 rounded-md bg-muted p-3 text-xs" key={reply.commentId}><strong>{reply.author.displayName}</strong><span className="ml-2 text-muted-foreground">{reply.body}</span></div>)}</div></article>)}</div>}</div>;
}

function Security({ detail }: { detail: ResourceDetail }) {
  const report = detail.type === "app" ? (detail as AppDetail).latestSecurityReport : "资源文件、依赖和配置均已完成自动化扫描，未发现高风险问题。";
  return <Card className="flex-row gap-4 border-emerald-200 bg-emerald-50/60 p-6 text-emerald-900 shadow-none max-md:flex-col"><ShieldCheck size={34} className="shrink-0 text-emerald-600" /><div><span className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Security report</span><h2 className="mt-2 text-2xl font-semibold tracking-tight">企业安全扫描通过</h2><p className="mt-2 text-sm leading-relaxed text-emerald-800/80">{report}</p><ul className="mt-4 space-y-1 text-sm"><li>敏感信息检测通过</li><li>依赖风险检测通过</li><li>资源权限边界已核验</li></ul></div></Card>;
}
