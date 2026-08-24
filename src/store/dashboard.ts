import { create } from "zustand";
import type { PublishDraft, ResourceType } from "@/types";

const emptyDraft = (type: ResourceType): PublishDraft => ({ type, name: "", slug: "", description: "", tags: [], version: "1.0.0", metadata: {}, assetNames: [] });

interface DashboardState {
  drafts: Record<ResourceType, PublishDraft>;
  activeType: ResourceType;
  publishStep: number;
  dirty: boolean;
  setActiveType: (type: ResourceType) => void;
  updateDraft: (type: ResourceType, patch: Partial<PublishDraft>) => void;
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
  setPublishStep: (publishStep) => set({ publishStep }),
  setDirty: (dirty) => set({ dirty }),
  resetDraft: (type) => set((state) => ({ drafts: { ...state.drafts, [type]: emptyDraft(type) }, publishStep: 0, dirty: false })),
}));
