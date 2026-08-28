export interface ContentPage {
  slug: "tutorials" | "about" | "updates";
  title: string;
  summary: string;
  markdown: string;
  updatedAt: string;
}

/** 服务端 /internal/portal/docs/:pageKey 的内容页结构。 */
export interface ContentPageDto {
  pageKey: string;
  title: string;
  bodyMarkdown: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
}

export type ContentPageSlug = ContentPage["slug"];
