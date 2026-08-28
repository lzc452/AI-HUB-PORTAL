import { AlertCircle, Inbox, RotateCw } from "lucide-react";
import { copy } from "@/apis/static-data";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

export function LoadingState({ label = copy.common.loading }: { label?: string }) {
  return <Empty className="min-h-[280px] border-0"><EmptyMedia variant="icon"><Spinner className="size-6" /></EmptyMedia><EmptyHeader><EmptyTitle className="sr-only">{label}</EmptyTitle><EmptyDescription>{label}</EmptyDescription></EmptyHeader></Empty>;
}

export function EmptyState({ title = copy.common.emptyTitle, description = copy.common.emptyDescription, action }: { title?: string; description?: string; action?: React.ReactNode }) {
  return <Empty className="min-h-[280px] border-0"><EmptyMedia variant="icon"><Inbox className="size-6" /></EmptyMedia><EmptyHeader><EmptyTitle>{title}</EmptyTitle><EmptyDescription>{description}</EmptyDescription></EmptyHeader>{action && <EmptyContent>{action}</EmptyContent>}</Empty>;
}

export function ErrorState({ retry, message = copy.common.errorDefault }: { retry?: () => void; message?: string }) {
  return <Empty className="min-h-[280px] border-0" role="alert"><EmptyMedia variant="icon"><AlertCircle className="size-6 text-destructive" /></EmptyMedia><EmptyHeader><EmptyTitle>{copy.common.errorTitle}</EmptyTitle><EmptyDescription>{message}</EmptyDescription></EmptyHeader>{retry && <EmptyContent><Button variant="outline" onClick={retry}><RotateCw size={15} />{copy.common.retry}</Button></EmptyContent>}</Empty>;
}
