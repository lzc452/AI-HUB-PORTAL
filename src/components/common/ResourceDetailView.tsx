import { copy, interpolate, resourcePaths, resourceTabs } from "@/apis/static-data";
import { CheckCircle2, Download, ExternalLink, File, Heart, MessageCircle, Reply, ShieldCheck, Star } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import type { AppDetail, McpDetail, PluginDetail, ResourceDetail, SkillDetail } from "@/types";
import { useCreateComment, useFavoriteMutation, useRequireLogin, useResourceComments } from "@/hooks";
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

const securityState = {
  passed: { label: copy.detail.scanPassed, tone: "text-emerald-600", card: "border-emerald-200 bg-emerald-50/60 text-emerald-900", icon: "text-emerald-600" },
  pending: { label: copy.detail.scanPending, tone: "text-amber-700", card: "border-amber-200 bg-amber-50/60 text-amber-900", icon: "text-amber-600" },
  failed: { label: copy.detail.scanFailed, tone: "text-red-700", card: "border-red-200 bg-red-50/60 text-red-900", icon: "text-red-600" },
  unknown: { label: copy.detail.scanUnknown, tone: "text-muted-foreground", card: "border-border bg-muted/40 text-foreground", icon: "text-muted-foreground" },
} as const;

export function ResourceDetailView({ detail }: { detail: ResourceDetail }) {
  const [params, setParams] = useSearchParams();
  const tabs = detail.files?.length ? [...resourceTabs.slice(0, 2), { key: "code", label: copy.detail.codeTab }, ...resourceTabs.slice(2)] : [...resourceTabs];
  const requestedTab = params.get("tab") ?? "overview";
  const active = tabs.some((tab) => tab.key === requestedTab) ? requestedTab : "overview";
  const favorite = useFavoriteMutation(detail.type, detail.id);
  const requireLogin = useRequireLogin();
  const changeTab = (tab: string) => setParams((current) => { if (tab === "overview") current.delete("tab"); else current.set("tab", tab); return current; }, { replace: true });
  const toggleFavorite = () => requireLogin(() => favorite.mutate(!detail.isStarred, { onSuccess: (_, activeValue) => activeValue ? toast.success(copy.detail.favoriteAdded) : toast.success(copy.detail.favoriteRemoved), onError: () => toast.error(copy.detail.favoriteFailed) }));
  const resourcePath = resourcePaths[detail.type];

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
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span>{interpolate(copy.detail.publishedBy, { name: detail.owner.displayName })}</span><span className="inline-flex items-center gap-1"><Star size={14} />{formatCompactNumber(detail.stars)}</span>{detail.downloads !== undefined && <span className="inline-flex items-center gap-1"><Download size={14} />{formatCompactNumber(detail.downloads)}</span>}</div>
          <div className="mt-3 flex flex-wrap gap-2">{detail.tags.map((tag) => <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground" key={tag}>{tag}</span>)}</div>
        </div>
        <Button variant={detail.isStarred ? "default" : "outline"} className="shrink-0 max-md:w-full" disabled={favorite.isPending} onClick={toggleFavorite}><Heart size={16} fill={detail.isStarred ? "currentColor" : "none"} />{detail.isStarred ? copy.detail.favorited : copy.detail.favorite}</Button>
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
            <strong>{copy.detail.startUsing}</strong><p className="m-0 text-sm text-muted-foreground">{copy.detail.currentStableVersion} <b className="text-foreground">{detail.version ? `v${detail.version}` : copy.detail.versionUnknown}</b></p>
            <Button className="w-full" onClick={() => requireLogin(() => changeTab("install"))}><ExternalLink size={15} />{detail.type === "app" ? copy.detail.openApp : copy.detail.viewInstall}</Button>
            <dl className="m-0 grid gap-4 border-t border-border pt-4 text-xs"><div><dt className="text-muted-foreground">{copy.detail.compatibility}</dt><dd className="mt-1 font-semibold">{detail.compatibility.length ? detail.compatibility.join(" · ") : copy.detail.compatibilityUnknown}</dd></div><div><dt className="text-muted-foreground">{copy.detail.securityStatus}</dt><dd className={`mt-1 inline-flex items-center gap-1 font-semibold ${securityState[detail.securityStatus].tone}`}><CheckCircle2 size={14} />{securityState[detail.securityStatus].label}</dd></div><div><dt className="text-muted-foreground">{copy.detail.recentlyUpdated}</dt><dd className="mt-1 font-semibold">{formatDate(detail.updatedAt)}</dd></div></dl>
          </Card>
        </div>
      </Tabs>
    </main>
  );
}

function Overview({ detail }: { detail: ResourceDetail }) {
  return <article className="space-y-8 text-[15px] leading-relaxed text-muted-foreground"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{copy.detail.overviewEyebrow}</span><MarkdownContent markdown={detail.overview} /><div><h3 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">{copy.detail.capabilityTags}</h3><div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">{detail.tags.map((tag) => <div className="flex flex-col gap-2 rounded-xl border border-border p-4" key={tag}><ShieldCheck className="size-[18px] text-emerald-600" /><strong className="text-sm text-foreground">{tag}</strong><span className="text-xs text-muted-foreground">{copy.detail.capabilityVerified}</span></div>)}</div></div></article>;
}

function Versions({ detail }: { detail: ResourceDetail }) {
  const rootFiles = detail.files ?? [];
  return <div className="space-y-4 text-muted-foreground"><h2 className="m-0 text-2xl font-semibold tracking-tight text-foreground">{copy.detail.versionsTitle}</h2><Card className="flex-row items-center justify-between gap-4 p-4 shadow-none"><div className="flex flex-col gap-1"><strong className="text-foreground">{detail.version ? `v${detail.version}` : copy.detail.versionUnknown}</strong><span className="text-xs">{interpolate(copy.detail.currentStableWithDate, { date: formatDate(detail.updatedAt) })}</span></div><StatusBadge status={detail.status} /></Card>{rootFiles.map((file) => <div className="flex items-center gap-3 border-b border-border py-3 text-sm" key={file.path}><File size={17} /><span className="text-foreground">{file.name}</span><small className="ml-auto">{file.type === "directory" ? `${file.children?.length ?? 0} 项` : `${file.size ?? 0} B`}</small></div>)}<p className="m-0 text-xs">{copy.detail.versionAssetsNote}</p></div>;
}

function Install({ detail }: { detail: ResourceDetail }) {
  let command = `在 AI Hub 中打开 ${detail.name}`;
  if (detail.type === "skill") command = (detail as SkillDetail).installCommand;
  if (detail.type === "plugin") command = (detail as PluginDetail).installCommand;
  if (detail.type === "mcp") command = (detail as McpDetail).configTemplate;
  const app = detail.type === "app" ? detail as AppDetail : null;
  return <div className="space-y-5 text-sm leading-relaxed text-muted-foreground"><h2 className="m-0 text-2xl font-semibold tracking-tight text-foreground">{detail.type === "app" ? copy.detail.installDeliveryTitle : copy.detail.installTitle}</h2><p className="m-0">{copy.detail.installPolicy}</p><pre className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-100"><code>{command}</code></pre>{app && <div className="flex flex-wrap gap-2">{app.deliveryTypes.map((type) => <span className="rounded-full bg-muted px-2.5 py-1 text-xs" key={type}>{type}</span>)}</div>}{detail.type === "mcp" && <p className="m-0 text-xs">{copy.detail.authMethod}{(detail as McpDetail).authentication}</p>}</div>;
}

function Comments({ detail }: { detail: ResourceDetail }) {
  const query = useResourceComments(detail.type, detail.id);
  const create = useCreateComment(detail.type, detail.id);
  const requireLogin = useRequireLogin();
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const submit = (event: FormEvent) => { event.preventDefault(); const value = body.trim(); if (!value) return; requireLogin(() => create.mutate({ body: value, parentCommentId: replyTo }, { onSuccess: () => { setBody(""); setReplyTo(null); } })); };
  useEffect(() => { if (query.data && window.location.hash.startsWith("#comment-")) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [query.data]);
  return <div className="space-y-6"><h2 className="m-0 text-2xl font-semibold tracking-tight">{copy.detail.commentsTitle}</h2><form className="space-y-3" onSubmit={submit}>{replyTo && <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{copy.detail.replyingTo}<Button type="button" variant="ghost" size="sm" onClick={() => setReplyTo(null)}>{copy.detail.cancelReply}</Button></div>}<Textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder={copy.detail.commentPlaceholder} className="min-h-28 resize-y" /><div className="flex items-center justify-between gap-3"><small className="text-xs text-muted-foreground">{body.length} / 4000</small><Button disabled={create.isPending || !body.trim()}><MessageCircle size={15} />{copy.detail.submitComment}</Button></div></form>{query.isPending ? <LoadingState /> : query.isError ? <ErrorState retry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title={copy.detail.noComments} description={copy.detail.noCommentsDescription} /> : <div className="overflow-hidden rounded-xl border border-border">{query.data.map((comment) => <article className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 border-b border-border p-4 last:border-b-0" id={`comment-${comment.commentId}`} key={comment.commentId}><Avatar className="size-9"><AvatarFallback>{initials(comment.author.displayName)}</AvatarFallback></Avatar><div><header className="flex items-center justify-between gap-3 max-md:flex-col max-md:items-start"><strong className="text-sm">{comment.author.displayName}</strong><time className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</time></header><p className="my-2 text-sm leading-relaxed text-muted-foreground">{comment.body}</p><Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => requireLogin(() => setReplyTo(comment.commentId))}><Reply size={13} />{copy.detail.reply}</Button>{comment.replies.map((reply) => <div className="mt-3 rounded-md bg-muted p-3 text-xs" key={reply.commentId}><strong>{reply.author.displayName}</strong><span className="ml-2 text-muted-foreground">{reply.body}</span></div>)}</div></article>)}</div>}</div>;
}

function Security({ detail }: { detail: ResourceDetail }) {
  const state = securityState[detail.securityStatus];
  const report = detail.type === "app" ? (detail as AppDetail).latestSecurityReport : undefined;
  return <Card className={`flex-row gap-4 p-6 shadow-none max-md:flex-col ${state.card}`}><ShieldCheck size={34} className={`shrink-0 ${state.icon}`} /><div><span className="text-xs font-semibold uppercase tracking-[0.08em]">{copy.detail.securityEyebrow}</span><h2 className="mt-2 text-2xl font-semibold tracking-tight">{copy.detail.securityHeadline}</h2><p className="mt-2 text-sm leading-relaxed opacity-80">{report ?? state.label}</p>{detail.securityStatus === "passed" && <ul className="mt-4 space-y-1 text-sm">{copy.detail.securityChecks.map((check) => <li key={check}>{check}</li>)}</ul>}</div></Card>;
}
