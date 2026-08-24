export interface ContentPage {
  slug: "tutorials" | "about" | "updates";
  title: string;
  summary: string;
  markdown: string;
  updatedAt: string;
}

export type ContentPageSlug = ContentPage["slug"];
