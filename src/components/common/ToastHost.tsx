import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { useEffect } from "react";
import { useUiStore } from "@/store";

export function ToastHost() {
  const toast = useUiStore((state) => state.toast);
  const clearToast = useUiStore((state) => state.clearToast);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(clearToast, 3_500);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);
  if (!toast) return null;
  const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? CircleAlert : Info;
  return <div className={`portal-toast portal-toast--${toast.tone}`} role="status"><Icon size={18} /><span>{toast.message}</span><button aria-label="关闭提示" onClick={clearToast}><X size={16} /></button></div>;
}
