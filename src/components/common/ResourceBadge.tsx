import { resourceTone, statusTone } from "@/apis/static-data";
import { Badge } from "@/components/ui/badge";
import type { PublishStatus, ResourceType } from "@/types";
import { cn, publishStatusLabel, resourceLabel } from "@/utils";

export function ResourceBadge({ type, className }: { type: ResourceType; className?: string }) {
  return <Badge variant="outline" className={cn("rounded-full text-[11px] font-semibold", resourceTone[type], className)}>{resourceLabel(type)}</Badge>;
}

export function StatusBadge({ status, className }: { status: PublishStatus; className?: string }) {
  return <Badge variant="outline" className={cn("rounded-full text-[11px] font-semibold", statusTone[status], className)}>{publishStatusLabel(status)}</Badge>;
}
