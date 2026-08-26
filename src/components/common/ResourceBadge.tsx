import { Badge } from "@/components/ui/badge";
import type { PublishStatus, ResourceType } from "@/types";
import { cn, publishStatusLabel, resourceLabel } from "@/utils";

const resourceTone: Record<ResourceType, string> = {
  app: "border-indigo-200 bg-indigo-50 text-indigo-700",
  skill: "border-violet-200 bg-violet-50 text-violet-700",
  plugin: "border-emerald-200 bg-emerald-50 text-emerald-700",
  mcp: "border-orange-200 bg-orange-50 text-orange-700",
};

const statusTone: Record<PublishStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  scanning: "border-amber-200 bg-amber-50 text-amber-700",
  pending_review: "border-violet-200 bg-violet-50 text-violet-700",
  published: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  withdrawn: "border-slate-200 bg-slate-50 text-slate-600",
};

export function ResourceBadge({ type, className }: { type: ResourceType; className?: string }) {
  return <Badge variant="outline" className={cn("rounded-full text-[11px] font-semibold", resourceTone[type], className)}>{resourceLabel(type)}</Badge>;
}

export function StatusBadge({ status, className }: { status: PublishStatus; className?: string }) {
  return <Badge variant="outline" className={cn("rounded-full text-[11px] font-semibold", statusTone[status], className)}>{publishStatusLabel(status)}</Badge>;
}
