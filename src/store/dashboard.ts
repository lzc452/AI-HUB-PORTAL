import { fallbacks } from "@/apis/static-data";
import { create } from "zustand";
import type { ApplicationDraft, PublishDraft, ResourceType } from "@/types";

const emptyApplicationDraft = (): ApplicationDraft => ({ name: "", departmentId: "", maintainerEmployeeIds: [], categoryId: "", applicationType: "web_app", tagIds: [], customCategoryName: "", customTagNames: [], icon: { mode: "auto", backgroundColor: null, text: null, assetId: null }, screenshotAssetIds: [], attachmentAssetIds: [], summaryHtml: "", manualHtml: null, manualAssetId: null, examplesHtml: null, examplesAssetId: null, faq: [], audience: [{ audienceType: "all", departmentId: null, employeeId: null, includeChildren: false }], risk: { handlesSensitiveData: false, sendsDataExternally: false, retainsConversations: false, retentionPeriod: null, modelProviders: [], providerNote: null, affectsHighRiskDecisions: false, inputRestrictionDisclaimer: "" }, deliveries: [{ channel: "web", entryUrl: "", minClientVersion: null, enabled: true, assetIds: [] }], version: fallbacks.defaultVersion, changelog: fallbacks.defaultChangelog });

const emptyDraft = (type: ResourceType): PublishDraft => type === "app"
  ? { type, name: "", slug: "", description: "", tags: [], version: fallbacks.defaultVersion, assetNames: [], applicationDraft: emptyApplicationDraft() }
  : { type, name: "", slug: "", description: "", tags: [], version: fallbacks.defaultVersion, metadata: {}, assetNames: [] };

interface DashboardState {
  drafts: Record<ResourceType, PublishDraft>;
  activeType: ResourceType;
  publishStep: number;
  dirty: boolean;
  setActiveType: (type: ResourceType) => void;
  updateDraft: (type: ResourceType, patch: Partial<PublishDraft>) => void;
  replaceDraft: (type: ResourceType, draft: PublishDraft) => void;
  setPublishStep: (step: number) => void;
  setDirty: (dirty: boolean) => void;
  resetDraft: (type: ResourceType) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  drafts: { app: emptyDraft("app"), skill: emptyDraft("skill"), plugin: emptyDraft("plugin"), mcp: emptyDraft("mcp") },
  activeType: "app",
  publishStep: 0,
  dirty: false,
  setActiveType: (activeType) => set({ activeType, publishStep: 1 }),
  updateDraft: (type, patch) => set((state) => ({ drafts: { ...state.drafts, [type]: { ...state.drafts[type], ...patch } }, dirty: true })),
  replaceDraft: (type, draft) => set((state) => ({ drafts: { ...state.drafts, [type]: draft }, dirty: false })),
  setPublishStep: (publishStep) => set({ publishStep }),
  setDirty: (dirty) => set({ dirty }),
  resetDraft: (type) => set((state) => ({ drafts: { ...state.drafts, [type]: emptyDraft(type) }, publishStep: 0, dirty: false })),
}));
