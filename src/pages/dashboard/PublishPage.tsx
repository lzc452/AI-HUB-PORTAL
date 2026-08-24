import { zodResolver } from "@hookform/resolvers/zod";
import { AppWindow, ArrowLeft, ArrowRight, Blocks, Bot, Check, FileUp, Puzzle, ScanSearch, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usePublishMutation } from "@/hooks";
import { publishDraftSchema, type PublishDraftForm } from "@/schemas";
import { useDashboardStore, useUiStore } from "@/store";
import type { ResourceType } from "@/types";
import { resourceLabel } from "@/utils";

const resourceOptions = [
  { type: "app" as const, icon: AppWindow, title: "App", description: "面向员工交付完整 AI 应用体验" },
  { type: "skill" as const, icon: Blocks, title: "Skill", description: "封装方法、触发条件与参考资料" },
  { type: "plugin" as const, icon: Puzzle, title: "Plugin", description: "把企业系统能力接入 AI 工作流" },
  { type: "mcp" as const, icon: Bot, title: "MCP", description: "发布标准化工具服务与配置模板" },
];

const stepLabels = ["选择类型", "资源信息", "上传资产", "安全扫描", "预览", "提交审核"];

export default function PublishPage() {
  const activeType = useDashboardStore((state) => state.activeType);
  const drafts = useDashboardStore((state) => state.drafts);
  const step = useDashboardStore((state) => state.publishStep);
  const dirty = useDashboardStore((state) => state.dirty);
  const setActiveType = useDashboardStore((state) => state.setActiveType);
  const updateDraft = useDashboardStore((state) => state.updateDraft);
  const setStep = useDashboardStore((state) => state.setPublishStep);
  const setDirty = useDashboardStore((state) => state.setDirty);
  const resetDraft = useDashboardStore((state) => state.resetDraft);
  const toast = useUiStore((state) => state.showToast);
  const publish = usePublishMutation();
  const [scanComplete, setScanComplete] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const draft = drafts[activeType];
  const form = useForm<PublishDraftForm>({ resolver: zodResolver(publishDraftSchema), defaultValues: { type: activeType, name: draft.name, slug: draft.slug, description: draft.description, tagsText: draft.tags.join("，"), version: draft.version, changelog: draft.metadata.changelog ?? "首次发布", repositoryUrl: draft.metadata.repositoryUrl ?? "", connectionType: (draft.metadata.connectionType as PublishDraftForm["connectionType"]) ?? "streamable_http" } });

  useEffect(() => {
    const current = useDashboardStore.getState().drafts[activeType];
    form.reset({ type: activeType, name: current.name, slug: current.slug, description: current.description, tagsText: current.tags.join("，"), version: current.version, changelog: current.metadata.changelog ?? "首次发布", repositoryUrl: current.metadata.repositoryUrl ?? "", connectionType: (current.metadata.connectionType as PublishDraftForm["connectionType"]) ?? "streamable_http" });
  }, [activeType, form]);

  useEffect(() => form.watch((value) => updateDraft(activeType, { name: value.name ?? "", slug: value.slug ?? "", description: value.description ?? "", tags: (value.tagsText ?? "").split(/[，,]/).map((item) => item.trim()).filter(Boolean), version: value.version ?? "1.0.0", metadata: { ...draft.metadata, changelog: value.changelog ?? "", repositoryUrl: value.repositoryUrl ?? "", connectionType: value.connectionType ?? "streamable_http" } })).unsubscribe, [activeType, draft.metadata, form, updateDraft]);

  useBeforeUnload((event) => { if (dirty && !submittedId) event.preventDefault(); });
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !submittedId && currentLocation.pathname !== nextLocation.pathname);

  const chooseType = (type: ResourceType) => { setActiveType(type); setScanComplete(false); setSubmittedId(null); };
  const nextFromMetadata = form.handleSubmit(() => setStep(2));
  const submit = form.handleSubmit((values) => {
    const value = { ...draft, type: activeType, name: values.name, slug: values.slug, description: values.description, tags: values.tagsText.split(/[，,]/).map((item) => item.trim()).filter(Boolean), version: values.version, metadata: { ...draft.metadata, changelog: values.changelog, repositoryUrl: values.repositoryUrl, connectionType: values.connectionType } };
    updateDraft(activeType, value);
    publish.mutate(value, { onSuccess: (result) => { setSubmittedId(result.resourceId); setDirty(false); setStep(5); toast("资源已提交审核", "success"); }, onError: () => toast("提交失败，请检查信息后重试", "error") });
  });

  return <div className="dashboard-page publish-page"><header className="dashboard-page-heading"><div><span className="portal-kicker">Publish workspace</span><h1>发布资源</h1><p>通过网页完成信息填写、资产上传、安全扫描与审核提交。</p></div></header><ol className="publish-steps">{stepLabels.map((label, index) => <li className={index === step ? "is-current" : index < step ? "is-done" : ""} key={label}><span>{index < step ? <Check size={14} /> : index + 1}</span><small>{label}</small></li>)}</ol>{step === 0 ? <section className="publish-type-grid">{resourceOptions.map(({ type, icon: Icon, title, description }) => <button key={type} onClick={() => chooseType(type)}><span className={`resource-type-icon resource-type-icon--${type}`}><Icon size={24} /></span><strong>{title}</strong><p>{description}</p><ArrowRight size={17} /></button>)}</section> : <form className="publish-form" onSubmit={submit}>
    {step === 1 && <section className="publish-form-panel"><PanelHeading icon={AppWindow} title={`${resourceLabel(activeType)}基本信息`} text="这些信息将显示在列表、详情和搜索结果中。" /><div className="form-grid"><label><span>资源名称</span><input {...form.register("name")} placeholder={`例如：${resourceLabel(activeType)}工作助手`} />{form.formState.errors.name && <em>{form.formState.errors.name.message}</em>}</label><label><span>英文标识</span><input {...form.register("slug")} placeholder="lowercase-resource-name" />{form.formState.errors.slug && <em>{form.formState.errors.slug.message}</em>}</label><label className="form-span-2"><span>资源说明</span><textarea {...form.register("description")} placeholder="说明解决的问题、适用对象与主要能力" />{form.formState.errors.description && <em>{form.formState.errors.description.message}</em>}</label><label><span>标签</span><input {...form.register("tagsText")} placeholder="效率，知识库，研发" />{form.formState.errors.tagsText && <em>{form.formState.errors.tagsText.message}</em>}</label><label><span>版本号</span><input {...form.register("version")} />{form.formState.errors.version && <em>{form.formState.errors.version.message}</em>}</label><label className="form-span-2"><span>版本说明</span><textarea {...form.register("changelog")} />{form.formState.errors.changelog && <em>{form.formState.errors.changelog.message}</em>}</label>{activeType === "plugin" && <label className="form-span-2"><span>代码仓库</span><input {...form.register("repositoryUrl")} placeholder="https://git.example.internal/team/project" />{form.formState.errors.repositoryUrl && <em>{form.formState.errors.repositoryUrl.message}</em>}</label>}{activeType === "mcp" && <label><span>连接类型</span><select {...form.register("connectionType")}><option value="stdio">stdio</option><option value="sse">SSE</option><option value="streamable_http">Streamable HTTP</option></select></label>}</div></section>}
    {step === 2 && <section className="publish-form-panel"><PanelHeading icon={FileUp} title="上传资产" text={activeType === "app" ? "上传图标、截图和可交付 Artifact。" : activeType === "skill" ? "上传 SKILL.md、references 与必要脚本。" : activeType === "plugin" ? "上传图标并确认仓库同步内容。" : "上传图标、配置示例与工具说明。"} /><label className="asset-dropzone"><FileUp size={30} /><strong>选择或拖入文件</strong><span>单个文件不超过 50 MB，上传内容将进入安全扫描。</span><input type="file" multiple onChange={(event) => updateDraft(activeType, { assetNames: Array.from(event.target.files ?? []).map((file) => file.name) })} /></label>{draft.assetNames.length > 0 && <ul className="asset-file-list">{draft.assetNames.map((name) => <li key={name}><FileUp size={15} />{name}<Check size={14} /></li>)}</ul>}</section>}
    {step === 3 && <section className="publish-form-panel scan-panel"><PanelHeading icon={ScanSearch} title="安全扫描" text="提交审核前检查敏感信息、恶意文件、依赖风险与权限边界。" /><div className={`scan-result${scanComplete ? " is-complete" : ""}`}><ShieldCheck size={42} /><strong>{scanComplete ? "安全扫描已通过" : "等待执行安全扫描"}</strong><p>{scanComplete ? "未发现阻断发布的高风险问题，扫描报告将随审核记录保存。" : "扫描通常在一分钟内完成，请保持页面打开。"}</p><button type="button" className="portal-button portal-button--primary" disabled={scanComplete} onClick={() => { setScanComplete(true); toast("安全扫描通过", "success"); }}>{scanComplete ? "扫描完成" : "开始扫描"}</button></div></section>}
    {step === 4 && <section className="publish-form-panel publish-preview"><PanelHeading icon={ShieldCheck} title="发布预览" text="确认员工将在 Portal 中看到的信息。" /><div className="preview-resource portal-card"><span className={`resource-type resource-type--${activeType}`}>{resourceLabel(activeType)}</span><h2>{draft.name || "未命名资源"}</h2><p>{draft.description}</p><div className="tag-list">{draft.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><dl><div><dt>英文标识</dt><dd>{draft.slug}</dd></div><div><dt>版本</dt><dd>{draft.version}</dd></div><div><dt>资产</dt><dd>{draft.assetNames.length} 个文件</dd></div><div><dt>安全扫描</dt><dd className="status-safe"><Check size={14} />已通过</dd></div></dl></div></section>}
    {step === 5 && <section className="publish-form-panel publish-success"><span><Send size={30} /></span><h2>已提交审核</h2><p>{draft.name} 已进入审核队列。审核结果会通过企业消息通知，你也可以在个人中心查看状态。</p><strong>审核编号：{submittedId}</strong><button type="button" className="portal-button portal-button--primary" onClick={() => resetDraft(activeType)}>继续发布资源</button></section>}
    {step > 0 && step < 5 && <div className="publish-actions"><button type="button" className="portal-button" onClick={() => setStep(Math.max(0, step - 1))}><ArrowLeft size={15} />上一步</button>{step === 1 ? <button key="metadata-next" type="button" className="portal-button portal-button--primary" onClick={nextFromMetadata}>下一步<ArrowRight size={15} /></button> : step === 4 ? <button key="review-submit" className="portal-button portal-button--primary" disabled={publish.isPending}>提交审核<Send size={15} /></button> : <button key={`step-next-${step}`} type="button" className="portal-button portal-button--primary" disabled={step === 3 && !scanComplete} onClick={(event) => { event.preventDefault(); setStep(step + 1); }}>下一步<ArrowRight size={15} /></button>}</div>}
  </form>}{blocker.state === "blocked" && <div className="leave-dialog-backdrop" role="presentation"><div className="leave-dialog portal-card" role="dialog" aria-modal="true" aria-labelledby="leave-title"><h2 id="leave-title">离开发布页面？</h2><p>当前草稿仍保留在本次会话中，但尚未提交审核。</p><div><button className="portal-button" onClick={() => blocker.reset()}>继续编辑</button><button className="portal-button portal-button--primary" onClick={() => blocker.proceed()}>确认离开</button></div></div></div>}</div>;
}

function PanelHeading({ icon: Icon, title, text }: { icon: typeof AppWindow; title: string; text: string }) {
  return <header className="publish-panel-heading"><span><Icon size={20} /></span><div><h2>{title}</h2><p>{text}</p></div></header>;
}
