import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav className="portal-pagination" aria-label="分页">
      <button aria-label="上一页" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></button>
      <span>第 {page} / {pages} 页</span>
      <button aria-label="下一页" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></button>
    </nav>
  );
}
