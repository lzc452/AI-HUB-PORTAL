import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppsUiState { display: "grid" | "list"; setDisplay: (display: "grid" | "list") => void; }
export const useAppsStore = create<AppsUiState>()(persist((set) => ({ display: "list", setDisplay: (display) => set({ display }) }), { name: "ai-hub-portal:apps-ui", partialize: (state) => ({ display: state.display }) }));
