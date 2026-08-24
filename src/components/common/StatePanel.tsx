import { AlertCircle, Inbox, LoaderCircle, RotateCw } from "lucide-react";

export function LoadingState({ label = "正在加载" }: { label?: string }) {
  return <div className="state-panel" role="status"><LoaderCircle className="state-panel__spin" /><p>{label}</p></div>;
}

export function EmptyState({ title = "暂无内容", description = "当前条件下没有可展示的数据。", action }: { title?: string; description?: string; action?: React.ReactNode }) {
  return <div className="state-panel"><Inbox /><strong>{title}</strong><p>{description}</p>{action}</div>;
}

export function ErrorState({ retry, message = "加载失败，请稍后重试。" }: { retry?: () => void; message?: string }) {
  return <div className="state-panel" role="alert"><AlertCircle /><strong>暂时无法加载</strong><p>{message}</p>{retry && <button className="portal-button" onClick={retry}><RotateCw size={15} />重试</button>}</div>;
}
