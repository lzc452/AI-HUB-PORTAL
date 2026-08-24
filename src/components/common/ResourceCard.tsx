import { ArrowUpRight, Download, Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { ResourceSummary } from "@/types";
import { formatCompactNumber, initials, resourceLabel } from "@/utils";

export function ResourceCard({ resource, compact = false }: { resource: ResourceSummary; compact?: boolean }) {
  return (
    <Link className={compact ? "resource-row" : "resource-card portal-card"} to={resource.href}>
      <div className="resource-card__icon" aria-hidden="true">
        {resource.iconUrl ? <img src={resource.iconUrl} alt="" /> : <span>{initials(resource.name)}</span>}
      </div>
      <div className="resource-card__body">
        <div className="resource-card__title-row">
          <strong>{resource.name}</strong>
          <span className={`resource-type resource-type--${resource.type}`}>{resourceLabel(resource.type)}</span>
        </div>
        <p>{resource.description}</p>
        <div className="resource-card__meta">
          <span>{resource.owner.displayName}</span>
          <span><Star size={13} />{formatCompactNumber(resource.stars)}</span>
          <span><Download size={13} />{formatCompactNumber(resource.downloads)}</span>
        </div>
      </div>
      <ArrowUpRight className="resource-card__arrow" size={17} aria-hidden="true" />
    </Link>
  );
}
