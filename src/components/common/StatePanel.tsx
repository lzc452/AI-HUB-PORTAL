import { AlertCircle, Inbox, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export function LoadingState({ label = "正在加载" }: { label?: string }) {
  return <Empty className="min-h-[280px] border-0"><EmptyMedia variant="icon"><Spinner className="size-6" /></EmptyMedia><EmptyHeader><EmptyTitle className="sr-only">{label}</EmptyTitle><EmptyDescription>{label}</EmptyDescription></EmptyHeader></Empty>;
}

export function EmptyState({ title = "暂无内容", description = "当前条件下没有可展示的数据。", action }: { title?: string; description?: string; action?: React.ReactNode }) {
  return <Empty className="min-h-[280px] border-0"><EmptyMedia variant="icon"><Inbox className="size-6" /></EmptyMedia><EmptyHeader><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>{action && <EmptyContent>{action}</EmptyContent>}</Empty>;
}

export function ErrorState({ retry, message = "加载失败，请稍后重试。" }: { retry?: () => void; message?: string }) {
  return <Empty className="min-h-[280px] border-0" role="alert"><EmptyMedia variant="icon"><AlertCircle className="size-6 text-destructive" /></EmptyMedia><EmptyHeader><EmptyTitle>暂时无法加载</EmptyTitle><EmptyDescription>{message}</EmptyDescription></EmptyHeader>{retry && <EmptyContent><Button variant="outline" onClick={retry}><RotateCw size={15} />重试</Button></EmptyContent>}</Empty>;
}
