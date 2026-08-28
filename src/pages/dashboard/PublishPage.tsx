import { zodResolver } from "@hookform/resolvers/zod";
import { completeApplicationUpload, createApplicationUpload, createPublishDraft, publishErrorGuidance, uploadApplicationContent, type PublishErrorGuidance } from "@/apis";
import { copy, fallbacks, interpolate, mcpConnectionTypes, publishResourceOptions, publishStepLabels } from "@/apis/static-data";
import { AppWindow, ArrowLeft, ArrowRight, Check, FileUp, ScanSearch, Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useBeforeUnload, useBlocker, useSearchParams } from "react-router-dom";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { PublishFlowError, useCurrentActor, useDepartmentsQuery, usePublishAppDraftQuery, usePublishMutation } from "@/hooks";
import { publishDraftSchema, type PublishDraftForm, type PublishDraftFormInput } from "@/schemas";
import { useDashboardStore } from "@/store";
import type { AppPublishDraft, ApplicationDraft, NativePublishDraft, PortalApplicationUpload, PublishDraft, ResourceType } from "@/types";
import { resourceLabel } from "@/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ResourceBadge } from "@/components/common/ResourceBadge";

const parseList = (value?: string) => (value ?? "").split(/[，,\n]/).map((item) => item.trim()).filter(Boolean);

function baseFormValues(draft: PublishDraft): PublishDraftForm {
  const app = draft.type === "app" ? draft.applicationDraft : null;
  return {
    type: draft.type,
    name: draft.name,
    slug: draft.slug,
    description: draft.description,
    tagsText: draft.tags.join("，"),
    version: draft.version,
    changelog: draft.type === "app" ? draft.applicationDraft.changelog : draft.metadata.changelog ?? fallbacks.defaultChangelog,
    repositoryUrl: draft.type === "app" ? "" : draft.metadata.repositoryUrl ?? "",
    connectionType: draft.type === "app" ? fallbacks.defaultConnectionType : (draft.metadata.connectionType as PublishDraftForm["connectionType"]) ?? fallbacks.defaultConnectionType,
    applicationType: "web_app",
    departmentId: app?.departmentId ?? "",
    categoryName: app?.customCategoryName ?? "",
    manualText: app?.manualHtml ?? "",
    examplesText: app?.examplesHtml ?? "",
    faqQuestion: app?.faq[0]?.question ?? "",
    faqAnswer: app?.faq[0]?.answer ?? "",
    screenshotAssetIdsText: app?.screenshotAssetIds.join("\n") ?? "",
    entryUrl: app?.deliveries.find((item) => item.channel === "web")?.entryUrl ?? "",
    inputRestrictionDisclaimer: app?.risk.inputRestrictionDisclaimer ?? "",
    modelProvider: app?.risk.modelProviders[0] ?? "local",
    handlesSensitiveData: app?.risk.handlesSensitiveData ?? false,
    sendsDataExternally: app?.risk.sendsDataExternally ?? false,
    retainsConversations: app?.risk.retainsConversations ?? false,
    affectsHighRiskDecisions: app?.risk.affectsHighRiskDecisions ?? false,
    retentionPeriod: app?.risk.retentionPeriod ?? "",
  };
}

function buildApplicationDraft(values: PublishDraftForm, current: ApplicationDraft, employeeId?: string): ApplicationDraft {
  const screenshotAssetIds = parseList(values.screenshotAssetIdsText);
  const existingWeb = current.deliveries.find((item) => item.channel === "web");
  return {
    ...current,
    name: values.name,
    departmentId: values.departmentId,
    applicationType: "web_app",
    icon: {
      mode: "auto",
      backgroundColor: current.icon.backgroundColor ?? fallbacks.defaultAppIconBackground,
      text: values.name.trim().slice(0, 1) || current.icon.text || fallbacks.initials,
      assetId: null,
    },
    maintainerEmployeeIds: employeeId ? Array.from(new Set([...current.maintainerEmployeeIds, employeeId])) : current.maintainerEmployeeIds,
    customCategoryName: values.categoryName.trim() || undefined,
    customTagNames: parseList(values.tagsText),
    screenshotAssetIds,
    summaryHtml: values.description,
    manualHtml: values.manualText.trim() || null,
    examplesHtml: values.examplesText.trim() || null,
    faq: [{ question: values.faqQuestion.trim(), answer: values.faqAnswer.trim() }],
    risk: { ...current.risk, handlesSensitiveData: values.handlesSensitiveData, sendsDataExternally: values.sendsDataExternally, retainsConversations: values.retainsConversations, retentionPeriod: values.retentionPeriod.trim() || null, modelProviders: [values.modelProvider], inputRestrictionDisclaimer: values.inputRestrictionDisclaimer.trim(), affectsHighRiskDecisions: values.affectsHighRiskDecisions },
    deliveries: [{ ...(existingWeb ?? { channel: "web" as const, minClientVersion: null, enabled: true, assetIds: [] }), channel: "web", entryUrl: values.entryUrl.trim() || null }],
    version: values.version,
    changelog: values.changelog,
  };
}

function buildPublishDraft(values: PublishDraftForm, current: PublishDraft, employeeId?: string): PublishDraft {
  return values.type === "app"
    ? { ...(current as AppPublishDraft), type: "app", name: values.name, slug: values.slug, description: values.description, tags: parseList(values.tagsText), version: values.version, applicationDraft: buildApplicationDraft(values, (current as AppPublishDraft).applicationDraft, employeeId) }
    : { ...(current as NativePublishDraft), type: values.type, name: values.name, slug: values.slug, description: values.description, tags: parseList(values.tagsText), version: values.version, metadata: { ...(current as NativePublishDraft).metadata, changelog: values.changelog, repositoryUrl: values.repositoryUrl, connectionType: values.connectionType } };
}

export default function PublishPage() {
  const [params] = useSearchParams();
  const requestedType = params.get("type");
  const requestedResourceType = requestedType && ["app", "skill", "plugin", "mcp"].includes(requestedType) ? requestedType as ResourceType : null;
  const requestedResourceId = params.get("resourceId");
  const activeType = useDashboardStore((state) => state.activeType);
  const drafts = useDashboardStore((state) => state.drafts);
  const step = useDashboardStore((state) => state.publishStep);
  const dirty = useDashboardStore((state) => state.dirty);
  const setActiveType = useDashboardStore((state) => state.setActiveType);
  const updateDraft = useDashboardStore((state) => state.updateDraft);
  const replaceDraft = useDashboardStore((state) => state.replaceDraft);
  const setStep = useDashboardStore((state) => state.setPublishStep);
  const setDirty = useDashboardStore((state) => state.setDirty);
  const resetDraft = useDashboardStore((state) => state.resetDraft);
  const actor = useCurrentActor();
  const departments = useDepartmentsQuery();
  const publish = usePublishMutation();
  const draftQuery = usePublishAppDraftQuery(activeType === "app" ? requestedResourceId : null);
  const [resourceId, setResourceId] = useState<string | null>(requestedResourceId);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<PublishErrorGuidance | null>(null);
  const [uploads, setUploads] = useState<PortalApplicationUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const draft = drafts[activeType];
  const form = useForm<PublishDraftFormInput, unknown, PublishDraftForm>({ resolver: zodResolver(publishDraftSchema), defaultValues: baseFormValues(draft) });

  useEffect(() => { if (requestedResourceType && requestedResourceType !== activeType) setActiveType(requestedResourceType); }, [activeType, requestedResourceType, setActiveType]);
  useEffect(() => { form.reset(baseFormValues(useDashboardStore.getState().drafts[activeType])); setResourceId(activeType === "app" ? requestedResourceId : null); setSubmittedId(null); setPublishError(null); setUploads([]); }, [activeType, form, requestedResourceId]);
  useEffect(() => { if (activeType === "app" && draftQuery.data) { const resumed: AppPublishDraft = { type: "app", name: draftQuery.data.resource.name, slug: draftQuery.data.resource.slug, description: draftQuery.data.resource.description, tags: draftQuery.data.resource.tags, version: draftQuery.data.applicationDraft.version, assetNames: [], applicationDraft: draftQuery.data.applicationDraft }; replaceDraft("app", resumed); form.reset(baseFormValues(resumed)); setResourceId(requestedResourceId); } }, [activeType, draftQuery.data, form, replaceDraft, requestedResourceId]);
  useEffect(() => { if (activeType === "app" && !form.getValues("departmentId") && actor.data?.primaryDepartmentId) form.setValue("departmentId", actor.data.primaryDepartmentId); }, [activeType, actor.data?.primaryDepartmentId, form]);
  useEffect(() => { setDirty(form.formState.isDirty); }, [form.formState.isDirty, setDirty]);
  useBeforeUnload((event) => { if (dirty && !submittedId) event.preventDefault(); });
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !submittedId && currentLocation.pathname !== nextLocation.pathname);

  const showError = (error: unknown) => {
    const cause = error instanceof PublishFlowError ? error.cause : error;
    if (error instanceof PublishFlowError) setResourceId(error.resourceId);
    const guidance = publishErrorGuidance(cause);
    setPublishError(guidance);
    const fields: Partial<Record<string, keyof PublishDraftForm>> = { departmentId: "departmentId", deliveries: "entryUrl", "deliveries.0.entryUrl": "entryUrl", faq: "faqQuestion", "faq.0.question": "faqQuestion", "faq.0.answer": "faqAnswer", screenshotAssetIds: "screenshotAssetIdsText", "risk.inputRestrictionDisclaimer": "inputRestrictionDisclaimer", "risk.modelProviders": "modelProvider" };
    guidance.issues.forEach((issue) => { const key = issue.path?.join("."); const normalizedKey = key?.replace(/^applicationDraft\./, ""); const field = (key ? fields[key] : undefined) ?? (normalizedKey ? fields[normalizedKey] : undefined); if (field) form.setError(field, { type: "server", message: issue.message }); });
    if (guidance.action === "edit") setStep(1);
    toast.error(guidance.message);
  };

  const chooseType = (type: ResourceType) => { setActiveType(type); setResourceId(null); setSubmittedId(null); setPublishError(null); setUploads([]); };
  const nextFromMetadata = form.handleSubmit(async (values) => {
    const current = useDashboardStore.getState().drafts[activeType];
    const value = buildPublishDraft(values, current, actor.data?.employeeId);
    updateDraft(activeType, value);
    if (activeType === "app") {
      try { const id = resourceId ?? (await createPublishDraft(value)).id; setResourceId(id); setStep(2); } catch (error) { showError(error); }
    } else setStep(2);
  });
  const uploadFiles = async (files: File[]) => {
    if (!resourceId || files.length === 0) return;
    setUploading(true);
    setPublishError(null);
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/") || file.size > 50 * 1024 * 1024) { throw new Error("截图需为图片且不超过 50 MB"); }
        const initialized = await createApplicationUpload(resourceId, { kind: "screenshot", fileName: file.name, mimeType: file.type, sizeBytes: file.size });
        setUploads((current) => [...current, initialized]);
        await uploadApplicationContent(resourceId, initialized.uploadId, file);
        const completed = await completeApplicationUpload(resourceId, initialized.uploadId);
        setUploads((current) => current.map((item) => item.uploadId === completed.uploadId ? completed : item));
        if (completed.assetId) {
          const ids = parseList(form.getValues("screenshotAssetIdsText"));
          if (!ids.includes(completed.assetId)) form.setValue("screenshotAssetIdsText", [...ids, completed.assetId].join("\n"), { shouldDirty: true });
        }
      }
    } catch (error) { showError(error); }
    finally { setUploading(false); }
  };
  const nextFromAssets = () => {
    if (uploading) return;
    if (activeType === "app" && parseList(form.getValues("screenshotAssetIdsText")).length === 0) { const guidance = { message: "请至少上传一张真实截图", issues: [], action: "edit" } as PublishErrorGuidance; setPublishError(guidance); toast.error(guidance.message); return; }
    setStep(3);
  };
  const submit = form.handleSubmit((values) => {
    const current = useDashboardStore.getState().drafts[activeType];
    const value = buildPublishDraft(values, current, actor.data?.employeeId);
    updateDraft(activeType, value);
    publish.mutate(resourceId ? { draft: value, resourceId } : value, { onSuccess: (result) => { setResourceId(result.resourceId); setSubmittedId(result.resourceId); setPublishError(null); setDirty(false); setStep(5); toast.success(copy.publish.submittedToast); }, onError: showError });
  });

  const scanSummary = activeType === "app" && uploads.some((upload) => upload.scanStatus === "failed") ? "存在服务端扫描失败资产" : activeType === "app" && uploads.length > 0 && uploads.every((upload) => upload.scanStatus === "passed") ? "服务端已返回扫描通过" : "待服务端校验";
  return <div className="space-y-7"><header className="mb-7"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Publish workspace</span><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{copy.publish.headerTitle}</h1><p className="mt-1 text-sm text-muted-foreground">{copy.publish.headerDescription}</p></header><ol className="grid grid-cols-6 gap-2 max-md:gap-1">{publishStepLabels.map((label, index) => <li className={`relative flex flex-col items-center gap-1.5 text-center text-xs ${index <= step ? "text-foreground" : "text-muted-foreground"}`} key={label}><span className={`relative z-10 grid size-7 place-items-center rounded-full border text-[11px] ${index === step ? "border-primary bg-primary text-primary-foreground" : index < step ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted"}`}>{index < step ? <Check size={14} /> : index + 1}</span><small className="max-md:hidden">{label}</small>{index > 0 && <i className={`absolute left-[-50%] right-[50%] top-3.5 h-px ${index <= step ? "bg-primary/40" : "bg-border"}`} />}</li>)}</ol>{step === 0 ? <section className="grid grid-cols-2 gap-3 max-md:grid-cols-1">{publishResourceOptions.map(({ type, icon: Icon, title, description, tone }) => <button type="button" className="relative min-h-44 rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg" key={type} onClick={() => chooseType(type)}><span className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon size={24} /></span><strong className="mt-4 block text-lg">{title}</strong><p className="mt-1 text-xs text-muted-foreground">{description}</p><ArrowRight className="absolute bottom-5 right-5 size-[17px]" /></button>)}</section> : <form className="overflow-hidden rounded-2xl border border-border bg-card" onSubmit={submit}>
    {step === 1 && <section className="min-h-[420px] space-y-6 p-7 max-md:p-5"><PanelHeading icon={AppWindow} title={`${resourceLabel(activeType)}基本信息`} text="这些信息将显示在列表、详情和搜索结果中。" /><div className="grid grid-cols-2 gap-5 max-md:grid-cols-1"><Field><FieldLabel htmlFor="publish-name">资源名称</FieldLabel><Input id="publish-name" {...form.register("name")} placeholder={interpolate(copy.publish.namePlaceholder, { label: resourceLabel(activeType) })} /><FieldError>{form.formState.errors.name?.message}</FieldError></Field><Field><FieldLabel htmlFor="publish-slug">{copy.publish.slugLabel}</FieldLabel><Input id="publish-slug" {...form.register("slug")} placeholder={copy.publish.slugPlaceholder} /><FieldError>{form.formState.errors.slug?.message}</FieldError></Field><Field className="col-span-2 max-md:col-span-1"><FieldLabel htmlFor="publish-description">资源说明</FieldLabel><Textarea id="publish-description" {...form.register("description")} placeholder={copy.publish.descriptionPlaceholder} /><FieldError>{form.formState.errors.description?.message}</FieldError></Field><Field><FieldLabel htmlFor="publish-tags">标签</FieldLabel><Input id="publish-tags" {...form.register("tagsText")} placeholder={copy.publish.tagsPlaceholder} /><FieldError>{form.formState.errors.tagsText?.message}</FieldError></Field><Field><FieldLabel htmlFor="publish-version">{copy.publish.versionLabel}</FieldLabel><Input id="publish-version" {...form.register("version")} /><FieldError>{form.formState.errors.version?.message}</FieldError></Field><Field className="col-span-2 max-md:col-span-1"><FieldLabel htmlFor="publish-changelog">版本说明</FieldLabel><Textarea id="publish-changelog" {...form.register("changelog")} /><FieldError>{form.formState.errors.changelog?.message}</FieldError></Field>{activeType === "plugin" && <Field className="col-span-2 max-md:col-span-1"><FieldLabel htmlFor="publish-repository">代码仓库</FieldLabel><Input id="publish-repository" {...form.register("repositoryUrl")} placeholder={copy.publish.repositoryPlaceholder} /><FieldError>{form.formState.errors.repositoryUrl?.message}</FieldError></Field>}{activeType === "mcp" && <Field><FieldLabel htmlFor="publish-connection">连接类型</FieldLabel><Controller control={form.control} name="connectionType" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="publish-connection" aria-label="连接类型"><SelectValue placeholder="选择连接类型" /></SelectTrigger><SelectContent>{mcpConnectionTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select>} /></Field>}</div>{activeType === "app" && <AppFields form={form} departments={departments.data ?? []} />}</section>}
    {step === 2 && <section className="min-h-[420px] p-7 max-md:p-5"><PanelHeading icon={FileUp} title="资产" text={activeType === "app" ? copy.publish.uploadApp : "Portal 资产接口就绪后，可在此关联真实资产。"} />{activeType === "app" ? <div className="space-y-4"><div className="rounded-xl border border-border bg-muted/30 p-5"><label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-center text-sm"><FileUp size={24} className="text-muted-foreground" /><strong>{resourceId ? "选择真实截图文件" : "正在准备应用草稿"}</strong><span className="text-xs text-muted-foreground">服务端会校验 MIME、文件内容和安全扫描；不会把本地文件名当作 assetId。</span><input className="sr-only" type="file" accept="image/*" multiple disabled={!resourceId || uploading} onChange={(event) => { void uploadFiles(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} /></label></div>{uploads.length > 0 && <ul className="space-y-2">{uploads.map((upload) => <li className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-xs" key={upload.uploadId}><span className="min-w-0 truncate">{upload.fileName}</span><span className={`shrink-0 font-semibold ${uploadStatusTone(upload.scanStatus)}`}>{uploadStatusLabel(upload)}</span></li>)}</ul>}{publishError && <p className="text-xs text-red-700">{publishError.message}</p>}</div> : <><div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><strong>非 App 资源使用既有 metadata/版本接口。</strong><p className="mt-2 text-xs leading-relaxed text-amber-800/80">当前资源不会把本地文件名当作上传结果。</p></div></>}</section>}
    {step === 3 && <section className="min-h-[420px] p-7 max-md:p-5"><PanelHeading icon={ScanSearch} title="安全扫描" text="提交审核前检查敏感信息、恶意文件、依赖风险与权限边界。" /><div className="flex min-h-64 flex-col items-center justify-center text-center"><ShieldCheck size={42} className="text-muted-foreground" /><strong className="mt-3">{copy.publish.scanWaiting}</strong><p className="max-w-lg text-xs text-muted-foreground">{copy.publish.scanServer}</p>{uploads.length > 0 && <p className="mt-3 text-xs font-semibold text-muted-foreground">{scanSummary}</p>}</div></section>}
    {step === 4 && <section className="min-h-[420px] p-7 max-md:p-5"><PanelHeading icon={ShieldCheck} title="发布预览" text="确认员工将在 Portal 中看到的信息。" /><Card className="mx-auto max-w-xl gap-4 p-6 shadow-none"><ResourceBadge type={activeType} /><h2 className="m-0 text-xl font-semibold">{form.getValues("name") || fallbacks.unnamedResource}</h2><p className="m-0 text-sm leading-relaxed text-muted-foreground">{form.getValues("description")}</p><div className="flex flex-wrap gap-2">{parseList(form.getValues("tagsText")).map((tag) => <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground" key={tag}>{tag}</span>)}</div><dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs max-md:grid-cols-1"><div><dt className="text-muted-foreground">{copy.publish.slugLabel}</dt><dd className="mt-1 font-semibold">{form.getValues("slug")}</dd></div><div><dt className="text-muted-foreground">{copy.publish.versionLabel}</dt><dd className="mt-1 font-semibold">{form.getValues("version")}</dd></div><div><dt className="text-muted-foreground">{copy.publish.assetsLabel}</dt><dd className="mt-1 font-semibold">{activeType === "app" ? `${parseList(form.getValues("screenshotAssetIdsText")).length} 个已关联资产` : "未关联"}</dd></div><div><dt className="text-muted-foreground">{copy.publish.scanLabel}</dt><dd className="mt-1 font-semibold text-muted-foreground">{scanSummary}</dd></div></dl></Card></section>}
    {step === 5 && <section className="flex min-h-[420px] flex-col items-center justify-center p-7 text-center max-md:p-5"><span className="grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Send size={30} /></span><h2 className="mt-4 text-xl font-semibold">{copy.publish.submittedTitle}</h2><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{interpolate(copy.publish.submittedDescription, { name: form.getValues("name") })}</p><strong className="mb-4 text-xs">{copy.publish.reviewId}{submittedId}</strong><Button type="button" onClick={() => { resetDraft(activeType); setResourceId(null); setSubmittedId(null); setUploads([]); }}>{copy.publish.publishAnother}</Button></section>}
    {publishError && <div className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><strong className="block">{copy.publish.failedTitle}</strong><p className="mt-1 text-xs leading-relaxed">{publishError.message}</p>{publishError.issues.length > 0 && <ul className="mt-2 space-y-1 text-xs">{publishError.issues.map((issue) => <li key={`${issue.code}-${issue.path?.join(".") ?? ""}`} className="flex gap-1.5"><span className="font-semibold">{issue.path ? issue.path.join(".") : issue.code}</span><span>{issue.message}</span></li>)}</ul>}{publishError.action === "edit" && <Button type="button" size="sm" className="mt-3" onClick={() => setStep(1)}>{copy.publish.backToEdit}</Button>}{publishError.action === "refresh" && <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => window.location.reload()}>{copy.publish.refreshRetry}</Button>}</div>}
    {step > 0 && step < 5 && <div className="flex items-center justify-between border-t border-border px-5 py-4"><Button type="button" variant="outline" onClick={() => setStep(Math.max(0, step - 1))}><ArrowLeft size={15} />{copy.publish.previous}</Button>{step === 1 ? <Button key="metadata-next" type="button" onClick={nextFromMetadata}>{copy.publish.next}<ArrowRight size={15} /></Button> : step === 2 ? <Button type="button" disabled={uploading} onClick={nextFromAssets}>{copy.publish.next}<ArrowRight size={15} /></Button> : step === 4 ? <Button key="review-submit" disabled={publish.isPending}>{copy.publish.submitReview}<Send size={15} /></Button> : <Button key={`step-next-${step}`} type="button" onClick={() => setStep(step + 1)}>{copy.publish.next}<ArrowRight size={15} /></Button>}</div>}
  </form>}<AlertDialog open={blocker.state === "blocked"} onOpenChange={(open) => { if (!open && blocker.state === "blocked") blocker.reset?.(); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{copy.publish.blockerTitle}</AlertDialogTitle><AlertDialogDescription>{copy.publish.blockerDescription}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => blocker.reset?.()}>{copy.publish.blockerStay}</AlertDialogCancel><AlertDialogAction onClick={() => blocker.proceed?.()}>{copy.publish.blockerLeave}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>;
}

const uploadTones = { passed: "text-emerald-700", pending: "text-amber-700", failed: "text-red-700", unknown: "text-muted-foreground" } as const;
function uploadStatusTone(status: string): string { return uploadTones[status as keyof typeof uploadTones] ?? uploadTones.unknown; }
function uploadStatusLabel(upload: PortalApplicationUpload): string {
  if (upload.errorCode) return upload.errorCode;
  if (upload.uploadStatus !== "completed") return "上传中";
  if (upload.scanStatus === "passed") return "服务端扫描通过";
  if (upload.scanStatus === "failed") return "服务端扫描失败";
  return "待服务端校验";
}

function AppFields({ form, departments }: { form: UseFormReturn<PublishDraftFormInput, unknown, PublishDraftForm>; departments: Array<{ departmentId: string; name: string }> }) {
  return (
    <div className="space-y-5 border-t border-border pt-5">
      <p className="text-xs leading-relaxed text-muted-foreground">{copy.publish.appWebOnly}</p>
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Field>
          <FieldLabel htmlFor="publish-department">{copy.publish.appDepartmentLabel}</FieldLabel>
          <Controller control={form.control} name="departmentId" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="publish-department"><SelectValue placeholder="选择部门" /></SelectTrigger>
              <SelectContent>{departments.map((item) => <SelectItem key={item.departmentId} value={item.departmentId}>{item.name}</SelectItem>)}</SelectContent>
            </Select>
          )} />
          <FieldError>{form.formState.errors.departmentId?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="publish-category">{copy.publish.appCategoryLabel}</FieldLabel>
          <Input id="publish-category" {...form.register("categoryName")} placeholder="例如：办公效率" />
          <FieldError>{form.formState.errors.categoryName?.message}</FieldError>
        </Field>
        <Field className="col-span-2 max-md:col-span-1">
          <FieldLabel htmlFor="publish-manual">{copy.publish.appManualLabel}</FieldLabel>
          <Textarea id="publish-manual" {...form.register("manualText")} placeholder="描述打开、配置和日常使用步骤" />
          <FieldError>{form.formState.errors.manualText?.message}</FieldError>
        </Field>
        <Field className="col-span-2 max-md:col-span-1">
          <FieldLabel htmlFor="publish-examples">{copy.publish.appExamplesLabel}</FieldLabel>
          <Textarea id="publish-examples" {...form.register("examplesText")} placeholder="提供至少一个真实使用示例" />
          <FieldError>{form.formState.errors.examplesText?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="publish-faq-question">{copy.publish.appFaqQuestionLabel}</FieldLabel>
          <Input id="publish-faq-question" {...form.register("faqQuestion")} />
          <FieldError>{form.formState.errors.faqQuestion?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="publish-faq-answer">{copy.publish.appFaqAnswerLabel}</FieldLabel>
          <Input id="publish-faq-answer" {...form.register("faqAnswer")} />
          <FieldError>{form.formState.errors.faqAnswer?.message}</FieldError>
        </Field>
        <Field className="col-span-2 max-md:col-span-1">
          <FieldLabel htmlFor="publish-entry-url">{copy.publish.appEntryUrlLabel}</FieldLabel>
          <Input id="publish-entry-url" {...form.register("entryUrl")} placeholder="https://" />
          <FieldError>{form.formState.errors.entryUrl?.message}</FieldError>
        </Field>
        <Field className="col-span-2 max-md:col-span-1">
          <FieldLabel htmlFor="publish-disclaimer">{copy.publish.appDisclaimerLabel}</FieldLabel>
          <Textarea id="publish-disclaimer" {...form.register("inputRestrictionDisclaimer")} placeholder="说明禁止输入的数据类型和使用限制" />
          <FieldError>{form.formState.errors.inputRestrictionDisclaimer?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="publish-provider">{copy.publish.appModelProviderLabel}</FieldLabel>
          <Controller control={form.control} name="modelProvider" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="publish-provider"><SelectValue /></SelectTrigger>
              <SelectContent>{["deepseek", "qwen", "wenxin", "hunyuan", "local", "other"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          )} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        {([["handlesSensitiveData", copy.publish.appRiskSensitive], ["sendsDataExternally", copy.publish.appRiskExternal], ["retainsConversations", copy.publish.appRiskRetention], ["affectsHighRiskDecisions", copy.publish.appRiskHighRisk]] as const).map(([name, label]) => (
          <label className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm" key={name}>
            {label}
            <Controller control={form.control} name={name} render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} aria-label={label} />} />
          </label>
        ))}
      </div>
      {form.watch("retainsConversations") && <Field><FieldLabel htmlFor="publish-retention">保留周期</FieldLabel><Input id="publish-retention" {...form.register("retentionPeriod")} placeholder="例如：30 天" /></Field>}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
        <strong>{copy.publish.uploadUnavailable}</strong>
        <p className="mt-1 text-amber-800/80">{copy.publish.uploadUnavailableNote}</p>
        <FieldError>{form.formState.errors.screenshotAssetIdsText?.message}</FieldError>
      </div>
    </div>
  );
}

function PanelHeading({ icon: Icon, title, text }: { icon: typeof AppWindow; title: string; text: string }) {
  return <header className="mb-6 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-muted"><Icon size={20} /></span><div><h2 className="m-0 text-lg font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{text}</p></div></header>;
}
