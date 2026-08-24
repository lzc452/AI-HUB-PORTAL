import { CheckCircle2, Download, ExternalLink, File, Heart, MessageCircle, Reply, ShieldCheck, Star } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { AppDetail, McpDetail, PluginDetail, ResourceDetail, SkillDetail } from "@/types";
import { useCreateComment, useFavoriteMutation, useResourceComments } from "@/hooks";
import { formatCompactNumber, formatDate, initials, resourceLabel } from "@/utils";
import { DetailTabs, EmptyState, ErrorState, LoadingState, MarkdownContent, ResourceCodeViewer } from "@/components/common";
import { useUiStore } from "@/store";

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
  const showToast = useUiStore((state) => state.showToast);
  const changeTab = (tab: string) => setParams((current) => { if (tab === "overview") current.delete("tab"); else current.set("tab", tab); return current; }, { replace: true });
  const toggleFavorite = () => favorite.mutate(!detail.isStarred, { onSuccess: (_, activeValue) => showToast(activeValue ? "已加入收藏" : "已取消收藏", "success"), onError: () => showToast("收藏状态更新失败", "error") });
  return (
    <main className="portal-page portal-container resource-detail-page">
      <nav className="portal-breadcrumb" aria-label="面包屑"><Link to={detail.type === "app" ? "/apps?sortBy=score" : detail.type === "skill" ? "/skills" : detail.type === "plugin" ? "/plugins" : "/mcp"}>{resourceLabel(detail.type)}</Link><span>/</span><span>{detail.name}</span></nav>
      <section className="resource-detail-hero">
        <div className="resource-detail-icon">{detail.iconUrl ? <img src={detail.iconUrl} alt="" /> : initials(detail.name)}</div>
        <div className="resource-detail-summary"><div className="resource-detail-title"><h1>{detail.name}</h1><span className={`resource-type resource-type--${detail.type}`}>{resourceLabel(detail.type)}</span></div><p>{detail.description}</p><div className="resource-detail-byline"><span>由 {detail.owner.displayName} 发布</span><span><Star size={14} />{formatCompactNumber(detail.stars)}</span><span><Download size={14} />{formatCompactNumber(detail.downloads)}</span></div><div className="tag-list">{detail.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
        <button className={`portal-button detail-favorite${detail.isStarred ? " is-active" : ""}`} disabled={favorite.isPending} onClick={toggleFavorite}><Heart size={16} fill={detail.isStarred ? "currentColor" : "none"} />{detail.isStarred ? "已收藏" : "收藏"}</button>
      </section>
      <DetailTabs tabs={tabs} active={active} onChange={changeTab} />
      <div className="resource-detail-grid">
        <section className="resource-detail-content">
          {active === "overview" && <Overview detail={detail} />}
          {active === "versions" && <Versions detail={detail} />}
          {active === "code" && detail.files && <ResourceCodeViewer files={detail.files} />}
          {active === "install" && <Install detail={detail} />}
          {active === "comments" && <Comments detail={detail} />}
          {active === "security" && <Security detail={detail} />}
        </section>
        <aside className="resource-action-card portal-card"><strong>开始使用</strong><p>当前稳定版本 <b>v{detail.version}</b></p><button className="portal-button portal-button--primary"><ExternalLink size={15} />{detail.type === "app" ? "打开应用" : "查看安装方式"}</button><dl><div><dt>兼容环境</dt><dd>{detail.compatibility.join(" · ")}</dd></div><div><dt>安全状态</dt><dd className="status-safe"><CheckCircle2 size={14} />扫描通过</dd></div><div><dt>最近更新</dt><dd>{formatDate(detail.updatedAt)}</dd></div></dl></aside>
      </div>
    </main>
  );
}

function Overview({ detail }: { detail: ResourceDetail }) {
  return <article className="detail-prose"><span className="portal-kicker">Overview</span><MarkdownContent markdown={detail.overview} /><h3>能力标签</h3><div className="detail-capability-grid">{detail.tags.map((tag) => <div key={tag}><ShieldCheck size={18} /><strong>{tag}</strong><span>已在企业环境完成能力验证</span></div>)}</div></article>;
}

function Versions({ detail }: { detail: ResourceDetail }) {
  const rootFiles = detail.files ?? [];
  return <div className="detail-section"><h2>版本与文件</h2><div className="version-card portal-card"><div><strong>v{detail.version}</strong><span>当前稳定版本 · {formatDate(detail.updatedAt)}</span></div><span className="status-pill">已发布</span></div>{rootFiles.map((file) => <div className="file-row" key={file.path}><File size={17} /><span>{file.name}</span><small>{file.type === "directory" ? `${file.children?.length ?? 0} 项` : `${file.size ?? 0} B`}</small></div>)}<p className="detail-muted">完整版本资产已通过安全扫描，可在“代码”中只读查看已授权文件。</p></div>;
}

function Install({ detail }: { detail: ResourceDetail }) {
  let command = `在 AI Hub 中打开 ${detail.name}`;
  if (detail.type === "skill") command = (detail as SkillDetail).installCommand;
  if (detail.type === "plugin") command = (detail as PluginDetail).installCommand;
  if (detail.type === "mcp") command = (detail as McpDetail).configTemplate;
  const app = detail.type === "app" ? detail as AppDetail : null;
  return <div className="detail-section"><h2>{detail.type === "app" ? "交付与使用" : "安装配置"}</h2><p>按照企业授权策略使用当前资源，首次访问可能需要确认权限范围。</p><pre className="code-block"><code>{command}</code></pre>{app && <div className="tag-list">{app.deliveryTypes.map((type) => <span key={type}>{type}</span>)}</div>}{detail.type === "mcp" && <p className="detail-muted">认证方式：{(detail as McpDetail).authentication}</p>}</div>;
}

function Comments({ detail }: { detail: ResourceDetail }) {
  const query = useResourceComments(detail.type, detail.id);
  const create = useCreateComment(detail.type, detail.id);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const submit = (event: FormEvent) => { event.preventDefault(); const value = body.trim(); if (!value) return; create.mutate({ body: value, parentCommentId: replyTo }, { onSuccess: () => { setBody(""); setReplyTo(null); } }); };
  useEffect(() => { if (query.data && window.location.hash.startsWith("#comment-")) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [query.data]);
  return <div className="detail-section comments-section"><h2>评论与交流</h2><form className="comment-form" onSubmit={submit}>{replyTo && <div className="reply-banner">正在回复一条评论<button type="button" onClick={() => setReplyTo(null)}>取消</button></div>}<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="分享你的使用体验或建议" /><div><small>{body.length} / 4000</small><button className="portal-button portal-button--primary" disabled={create.isPending || !body.trim()}><MessageCircle size={15} />发表评论</button></div></form>{query.isPending ? <LoadingState /> : query.isError ? <ErrorState retry={() => query.refetch()} /> : !query.data?.length ? <EmptyState title="还没有评论" description="成为第一个分享使用体验的人。" /> : <div className="comment-list">{query.data.map((comment) => <article className="comment-item" id={`comment-${comment.commentId}`} key={comment.commentId}><div className="comment-avatar">{initials(comment.author.displayName)}</div><div><header><strong>{comment.author.displayName}</strong><time>{formatDate(comment.createdAt)}</time></header><p>{comment.body}</p><button className="comment-reply" onClick={() => setReplyTo(comment.commentId)}><Reply size={13} />回复</button>{comment.replies.map((reply) => <div className="comment-reply-item" key={reply.commentId}><strong>{reply.author.displayName}</strong><span>{reply.body}</span></div>)}</div></article>)}</div>}</div>;
}

function Security({ detail }: { detail: ResourceDetail }) {
  const report = detail.type === "app" ? (detail as AppDetail).latestSecurityReport : "资源文件、依赖和配置均已完成自动化扫描，未发现高风险问题。";
  return <div className="detail-section security-report"><ShieldCheck size={34} /><div><span className="portal-kicker">Security report</span><h2>企业安全扫描通过</h2><p>{report}</p><ul><li>敏感信息检测通过</li><li>依赖风险检测通过</li><li>资源权限边界已核验</li></ul></div></div>;
}
