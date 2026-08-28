import { ArrowUpRight, Download, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { ResourceSummary } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn, formatCompactNumber, initials } from "@/utils";
import { ResourceBadge } from "@/components/common/ResourceBadge";

export function ResourceCard({ resource, compact = false, className }: { resource: ResourceSummary; compact?: boolean; className?: string }) {
  const content = <>
    <Avatar className="size-11 shrink-0 rounded-xl border border-border bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700">
      <AvatarImage src={resource.iconUrl ?? undefined} alt="" />
      <AvatarFallback className="rounded-xl bg-transparent text-xs font-extrabold text-indigo-700">{initials(resource.name)}</AvatarFallback>
    </Avatar>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <strong className="min-w-0 truncate text-[15px]">{resource.name}</strong>
        <ResourceBadge type={resource.type} />
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{resource.description}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>{resource.owner.displayName}</span>
        <span className="inline-flex items-center gap-1"><Star size={13} />{formatCompactNumber(resource.stars)}</span>
        {resource.downloads !== undefined && <span className="inline-flex items-center gap-1"><Download size={13} />{formatCompactNumber(resource.downloads)}</span>}
      </div>
    </div>
    <ArrowUpRight className="size-[17px] shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
  </>;

  if (compact) {
    return <Link className={cn("group relative flex min-h-20 items-center gap-3 border-b border-border px-3 py-4 last:border-b-0 hover:bg-muted/50", className)} to={resource.href}>{content}</Link>;
  }

  return <Link className="group block h-full" to={resource.href}><Card className={cn("relative flex h-full min-h-44 flex-row gap-4 rounded-xl p-5 shadow-none transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg", className)}>{content}</Card></Link>;
}
