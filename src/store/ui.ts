import { create } from "zustand";

interface UiState {
  mobileMenuOpen: boolean;
  toast: { id: number; message: string; tone: "info" | "success" | "error" } | null;
  setMobileMenuOpen: (open: boolean) => void;
  showToast: (message: string, tone?: "info" | "success" | "error") => void;
  clearToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  mobileMenuOpen: false,
  toast: null,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  showToast: (message, tone = "info") => set({ toast: { id: Date.now(), message, tone } }),
  clearToast: () => set({ toast: null }),
}));
