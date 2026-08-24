import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SkillsUiState { display: "grid" | "list"; setDisplay: (display: "grid" | "list") => void; }
export const useSkillsStore = create<SkillsUiState>()(persist((set) => ({ display: "list", setDisplay: (display) => set({ display }) }), { name: "ai-hub-portal:skills-ui", partialize: (state) => ({ display: state.display }) }));
