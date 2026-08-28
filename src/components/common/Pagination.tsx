import { copy, interpolate } from "@/apis/static-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination as PaginationRoot, PaginationContent, PaginationItem } from "@/components/ui/pagination";

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <PaginationRoot aria-label={copy.pagination.aria} className="mt-8 text-sm text-muted-foreground">
      <PaginationContent>
        <PaginationItem><Button variant="outline" size="icon" aria-label={copy.pagination.previous} disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></Button></PaginationItem>
        <li className="px-3 text-sm text-muted-foreground">{interpolate(copy.pagination.pageLabel, { page, pages })}</li>
        <PaginationItem><Button variant="outline" size="icon" aria-label={copy.pagination.next} disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></Button></PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
