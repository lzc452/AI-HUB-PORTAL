import { zodResolver } from "@hookform/resolvers/zod";
import { AppWindow, ArrowLeft, ArrowRight, Blocks, Bot, Check, FileUp, Puzzle, ScanSearch, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { usePublishMutation } from "@/hooks";
import { publishDraftSchema, type PublishDraftForm } from "@/schemas";
import { useDashboardStore } from "@/store";
import type { ResourceType } from "@/types";
import { resourceLabel } from "@/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResourceBadge } from "@/components/common/ResourceBadge";

const resourceOptions = [
  { type: "app" as const, icon: AppWindow, title: "App", description: "面向员工交付完整 AI 应用体验", tone: "bg-indigo-50 text-indigo-700" },
  { type: "skill" as const, icon: Blocks, title: "Skill", description: "封装方法、触发条件与参考资料", tone: "bg-violet-50 text-violet-700" },
  { type: "plugin" as const, icon: Puzzle, title: "Plugin", description: "把企业系统能力接入 AI 工作流", tone: "bg-emerald-50 text-emerald-700" },
  { type: "mcp" as const, icon: Bot, title: "MCP", description: "发布标准化工具服务与配置模板", tone: "bg-orange-50 text-orange-700" },
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
    publish.mutate(value, { onSuccess: (result) => { setSubmittedId(result.resourceId); setDirty(false); setStep(5); toast.success("资源已提交审核"); }, onError: () => toast.error("提交失败，请检查信息后重试") });
  });

  return <div className="space-y-7"><header className="mb-7"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Publish workspace</span><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">发布资源</h1><p className="mt-1 text-sm text-muted-foreground">通过网页完成信息填写、资产上传、安全扫描与审核提交。</p></header><ol className="grid grid-cols-6 gap-2 max-md:gap-1">{stepLabels.map((label, index) => <li className={`relative flex flex-col items-center gap-1.5 text-center text-xs ${index <= step ? "text-foreground" : "text-muted-foreground"}`} key={label}><span className={`relative z-10 grid size-7 place-items-center rounded-full border text-[11px] ${index === step ? "border-primary bg-primary text-primary-foreground" : index < step ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted"}`}>{index < step ? <Check size={14} /> : index + 1}</span><small className="max-md:hidden">{label}</small>{index > 0 && <i className={`absolute left-[-50%] right-[50%] top-3.5 h-px ${index <= step ? "bg-primary/40" : "bg-border"}`} />}</li>)}</ol>{step === 0 ? <section className="grid grid-cols-2 gap-3 max-md:grid-cols-1">{resourceOptions.map(({ type, icon: Icon, title, description, tone }) => <button type="button" className="relative min-h-44 rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg" key={type} onClick={() => chooseType(type)}><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon size={24} /></span><strong className="mt-4 block text-lg">{title}</strong><p className="mt-1 text-xs text-muted-foreground">{description}</p><ArrowRight className="absolute bottom-5 right-5 size-[17px]" /></button>)}</section> : <form className="overflow-hidden rounded-2xl border border-border bg-card" onSubmit={submit}>
    {step === 1 && <section className="min-h-[420px] p-7 max-md:p-5"><PanelHeading icon={AppWindow} title={`${resourceLabel(activeType)}基本信息`} text="这些信息将显示在列表、详情和搜索结果中。" /><div className="grid grid-cols-2 gap-5 max-md:grid-cols-1"><Field><FieldLabel htmlFor="publish-name">资源名称</FieldLabel><Input id="publish-name" {...form.register("name")} placeholder={`例如：${resourceLabel(activeType)}工作助手`} /><FieldError>{form.formState.errors.name?.message}</FieldError></Field><Field><FieldLabel htmlFor="publish-slug">英文标识</FieldLabel><Input id="publish-slug" {...form.register("slug")} placeholder="lowercase-resource-name" /><FieldError>{form.formState.errors.slug?.message}</FieldError></Field><Field className="col-span-2 max-md:col-span-1"><FieldLabel htmlFor="publish-description">资源说明</FieldLabel><Textarea id="publish-description" {...form.register("description")} placeholder="说明解决的问题、适用对象与主要能力" /><FieldError>{form.formState.errors.description?.message}</FieldError></Field><Field><FieldLabel htmlFor="publish-tags">标签</FieldLabel><Input id="publish-tags" {...form.register("tagsText")} placeholder="效率，知识库，研发" /><FieldError>{form.formState.errors.tagsText?.message}</FieldError></Field><Field><FieldLabel htmlFor="publish-version">版本号</FieldLabel><Input id="publish-version" {...form.register("version")} /><FieldError>{form.formState.errors.version?.message}</FieldError></Field><Field className="col-span-2 max-md:col-span-1"><FieldLabel htmlFor="publish-changelog">版本说明</FieldLabel><Textarea id="publish-changelog" {...form.register("changelog")} /><FieldError>{form.formState.errors.changelog?.message}</FieldError></Field>{activeType === "plugin" && <Field className="col-span-2 max-md:col-span-1"><FieldLabel htmlFor="publish-repository">代码仓库</FieldLabel><Input id="publish-repository" {...form.register("repositoryUrl")} placeholder="https://git.example.internal/team/project" /><FieldError>{form.formState.errors.repositoryUrl?.message}</FieldError></Field>}{activeType === "mcp" && <Field><FieldLabel htmlFor="publish-connection">连接类型</FieldLabel><Controller control={form.control} name="connectionType" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="publish-connection" aria-label="连接类型" aria-invalid={Boolean(form.formState.errors.connectionType)}><SelectValue placeholder="选择连接类型" /></SelectTrigger><SelectContent><SelectItem value="stdio">stdio</SelectItem><SelectItem value="sse">SSE</SelectItem><SelectItem value="streamable_http">Streamable HTTP</SelectItem></SelectContent></Select>} /></Field>}</div></section>}
    {step === 2 && <section className="min-h-[420px] p-7 max-md:p-5"><PanelHeading icon={FileUp} title="上传资产" text={activeType === "app" ? "上传图标、截图和可交付 Artifact。" : activeType === "skill" ? "上传 SKILL.md、references 与必要脚本。" : activeType === "plugin" ? "上传图标并确认仓库同步内容。" : "上传图标、配置示例与工具说明。"} /><label className="flex min-h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/50 text-center text-muted-foreground"><FileUp size={30} /><strong className="text-sm text-foreground">选择或拖入文件</strong><span className="text-[11px]">单个文件不超过 50 MB，上传内容将进入安全扫描。</span><Input className="sr-only" type="file" multiple onChange={(event) => updateDraft(activeType, { assetNames: Array.from(event.target.files ?? []).map((file) => file.name) })} /></label>{draft.assetNames.length > 0 && <ul className="mt-3 divide-y divide-border">{draft.assetNames.map((name) => <li className="flex items-center gap-2 py-2 text-xs" key={name}><FileUp size={15} />{name}<Check className="ml-auto text-emerald-600" size={14} /></li>)}</ul>}</section>}
    {step === 3 && <section className="min-h-[420px] p-7 max-md:p-5"><PanelHeading icon={ScanSearch} title="安全扫描" text="提交审核前检查敏感信息、恶意文件、依赖风险与权限边界。" /><div className="flex min-h-64 flex-col items-center justify-center text-center"><ShieldCheck size={42} className={scanComplete ? "text-emerald-600" : "text-muted-foreground"} /><strong className="mt-3">{scanComplete ? "安全扫描已通过" : "等待执行安全扫描"}</strong><p className="max-w-lg text-xs text-muted-foreground">{scanComplete ? "未发现阻断发布的高风险问题，扫描报告将随审核记录保存。" : "扫描通常在一分钟内完成，请保持页面打开。"}</p><Button type="button" className="mt-3" disabled={scanComplete} onClick={() => { setScanComplete(true); toast.success("安全扫描通过"); }}>{scanComplete ? "扫描完成" : "开始扫描"}</Button></div></section>}
    {step === 4 && <section className="min-h-[420px] p-7 max-md:p-5"><PanelHeading icon={ShieldCheck} title="发布预览" text="确认员工将在 Portal 中看到的信息。" /><Card className="mx-auto max-w-xl gap-4 p-6 shadow-none"><ResourceBadge type={activeType} /><h2 className="m-0 text-xl font-semibold">{draft.name || "未命名资源"}</h2><p className="m-0 text-sm leading-relaxed text-muted-foreground">{draft.description}</p><div className="flex flex-wrap gap-2">{draft.tags.map((tag) => <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground" key={tag}>{tag}</span>)}</div><dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs max-md:grid-cols-1"><div><dt className="text-muted-foreground">英文标识</dt><dd className="mt-1 font-semibold">{draft.slug}</dd></div><div><dt className="text-muted-foreground">版本</dt><dd className="mt-1 font-semibold">{draft.version}</dd></div><div><dt className="text-muted-foreground">资产</dt><dd className="mt-1 font-semibold">{draft.assetNames.length} 个文件</dd></div><div><dt className="text-muted-foreground">安全扫描</dt><dd className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-600"><Check size={14} />已通过</dd></div></dl></Card></section>}
    {step === 5 && <section className="flex min-h-[420px] flex-col items-center justify-center p-7 text-center max-md:p-5"><span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Send size={30} /></span><h2 className="mt-4 text-xl font-semibold">已提交审核</h2><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{draft.name} 已进入审核队列。审核结果会通过企业消息通知，你也可以在个人中心查看状态。</p><strong className="mb-4 text-xs">审核编号：{submittedId}</strong><Button type="button" onClick={() => resetDraft(activeType)}>继续发布资源</Button></section>}
    {step > 0 && step < 5 && <div className="flex items-center justify-between border-t border-border px-5 py-4"><Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))}><ArrowLeft size={15} />上一步</Button>{step === 1 ? <Button key="metadata-next" type="button" onClick={nextFromMetadata}>下一步<ArrowRight size={15} /></Button> : step === 4 ? <Button key="review-submit" disabled={publish.isPending}>提交审核<Send size={15} /></Button> : <Button key={`step-next-${step}`} type="button" disabled={step === 3 && !scanComplete} onClick={(event) => { event.preventDefault(); setStep(step + 1); }}>下一步<ArrowRight size={15} /></Button>}</div>}
   </form>}<AlertDialog open={blocker.state === "blocked"} onOpenChange={(open) => { if (!open && blocker.state === "blocked") blocker.reset?.(); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>离开发布页面？</AlertDialogTitle><AlertDialogDescription>当前草稿仍保留在本次会话中，但尚未提交审核。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => blocker.reset?.()}>继续编辑</AlertDialogCancel><AlertDialogAction onClick={() => blocker.proceed?.()}>确认离开</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>;
}

function PanelHeading({ icon: Icon, title, text }: { icon: typeof AppWindow; title: string; text: string }) {
  return <header className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-muted"><Icon size={20} /></span><div><h2 className="m-0 text-lg font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{text}</p></div></header>;
}
