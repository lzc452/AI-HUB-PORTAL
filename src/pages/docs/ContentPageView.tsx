import { CalendarDays, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState, MarkdownContent } from "@/components/common";
import { copy, docsNavigation } from "@/apis/static-data";
import { useContentPageQuery } from "@/hooks";
import { useDocsStore } from "@/store";
import type { ContentPageSlug } from "@/types";
import { formatDate } from "@/utils";

export function ContentPageView({ slug }: { slug: ContentPageSlug }) {
  const query = useContentPageQuery(slug);
  const tocOpen = useDocsStore((state) => state.tocOpen);
  const setTocOpen = useDocsStore((state) => state.setTocOpen);
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label={copy.docs.loading} /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} /></main>;
  return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 pb-[72px] max-md:w-[calc(100%-28px)] max-md:py-8"><header className="mb-10 max-w-3xl"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{copy.docs.eyebrow}</span><h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em]">{query.data.title}</h1>{query.data.summary && <p className="mt-2 text-base leading-relaxed text-muted-foreground">{query.data.summary}</p>}<small className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays size={14} />{copy.docs.updated} {formatDate(query.data.updatedAt)}</small></header><Button variant="outline" className="mb-4 hidden max-md:inline-flex" onClick={() => setTocOpen(!tocOpen)}><Menu size={15} />{copy.docs.toc}</Button><div className="grid grid-cols-[220px_minmax(0,760px)] items-start gap-16 max-[900px]:grid-cols-[180px_minmax(0,1fr)] max-md:block"><aside className={`sticky top-[86px] flex flex-col gap-2.5 border-l border-border pl-4 text-xs max-md:static max-md:mb-5 ${tocOpen ? "max-md:flex" : "max-md:hidden"}`}><strong>{copy.docs.navigation}</strong>{docsNavigation.map((item) => <Link className="text-muted-foreground hover:text-foreground" to={item.href} onClick={() => setTocOpen(false)} key={item.href}>{item.label}</Link>)}</aside><MarkdownContent className="text-muted-foreground" markdown={query.data.markdown} /></div></main>;
}
