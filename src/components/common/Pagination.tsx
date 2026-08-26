import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pagination as PaginationRoot, PaginationContent, PaginationItem } from "@/components/ui/pagination";

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <PaginationRoot aria-label="分页" className="mt-8 text-sm text-muted-foreground">
      <PaginationContent>
        <PaginationItem><Button variant="outline" size="icon" aria-label="上一页" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></Button></PaginationItem>
        <li className="px-3 text-sm text-muted-foreground">第 {page} / {pages} 页</li>
        <PaginationItem><Button variant="outline" size="icon" aria-label="下一页" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></Button></PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}
