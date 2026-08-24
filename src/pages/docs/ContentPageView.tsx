import { CalendarDays, Menu } from "lucide-react";
import { ErrorState, LoadingState, MarkdownContent } from "@/components/common";
import { useContentPageQuery } from "@/hooks";
import { useDocsStore } from "@/store";
import type { ContentPageSlug } from "@/types";
import { formatDate } from "@/utils";

export function ContentPageView({ slug }: { slug: ContentPageSlug }) {
  const query = useContentPageQuery(slug);
  const tocOpen = useDocsStore((state) => state.tocOpen);
  const setTocOpen = useDocsStore((state) => state.setTocOpen);
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载文档" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} /></main>;
  return <main className="portal-page portal-container docs-page"><header><span className="portal-kicker">AI Hub Docs</span><h1>{query.data.title}</h1><p>{query.data.summary}</p><small><CalendarDays size={14} />更新于 {formatDate(query.data.updatedAt)}</small></header><button className="portal-button docs-toc-toggle" onClick={() => setTocOpen(!tocOpen)}><Menu size={15} />目录</button><div className="docs-layout"><aside className={tocOpen ? "is-open" : ""}><strong>文档导航</strong><a href="/tutorials" onClick={() => setTocOpen(false)}>使用指南</a><a href="/updates" onClick={() => setTocOpen(false)}>更新日志</a><a href="/about" onClick={() => setTocOpen(false)}>关于我们</a></aside><MarkdownContent className="docs-prose" markdown={query.data.markdown} /></div></main>;
}
