import { create } from "zustand";

interface DocsUiState { tocOpen: boolean; setTocOpen: (open: boolean) => void; }
export const useDocsStore = create<DocsUiState>((set) => ({ tocOpen: false, setTocOpen: (tocOpen) => set({ tocOpen }) }));
