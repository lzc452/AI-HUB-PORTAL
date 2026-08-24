import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SourceUiState { display: Record<"plugin" | "mcp", "grid" | "list">; setDisplay: (type: "plugin" | "mcp", display: "grid" | "list") => void; }
export const useSourceStore = create<SourceUiState>()(persist((set) => ({ display: { plugin: "list", mcp: "list" }, setDisplay: (type, value) => set((state) => ({ display: { ...state.display, [type]: value } })) }), { name: "ai-hub-portal:source-ui", partialize: (state) => ({ display: state.display }) }));
