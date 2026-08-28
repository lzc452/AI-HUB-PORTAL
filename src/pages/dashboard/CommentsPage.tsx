import { ArrowUpRight, MessageCircleReply, MessagesSquare } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
  ResourceBadge,
} from "@/components/common";
import { commentResourceTypeOptions, commentSortOptions, copy } from "@/apis/static-data";
import { useDashboardCommentsQuery } from "@/hooks";
import { dashboardCommentsQuerySchema } from "@/schemas";
import { formatDate, initials } from "@/utils";

export default function CommentsPage() {
  const [params, setParams] = useSearchParams();
  const state = dashboardCommentsQuerySchema.parse({
    view: params.get("view") || undefined,
    resourceType: params.get("resourceType") || undefined,
    sort: params.get("sort") || undefined,
    page: params.get("page") || undefined,
    pageSize: params.get("pageSize") || undefined,
  });
  const query = useDashboardCommentsQuery(state);
  const update = (values: Record<string, string | undefined>) =>
    setParams(
      (current) => {
        Object.entries(values).forEach(([key, value]) =>
          value ? current.set(key, value) : current.delete(key),
        );
        if (!("page" in values)) current.set("page", "1");
        return current;
      },
      { replace: true },
    );
  const list = query.isPending ? (
    <LoadingState label={copy.comments.loading} />
  ) : query.isError ? (
    <ErrorState retry={() => query.refetch()} />
  ) : !query.data?.items.length ? (
    <EmptyState
      title={state.view === "replies" ? copy.comments.emptyReplies : copy.comments.emptyMine}
      description={copy.comments.emptyDescription}
    />
  ) : (
    <Card className="overflow-hidden p-0 shadow-none">
      <div>
        {query.data.items.map((item) => (
          <article
            className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 border-b border-border p-4 last:border-b-0"
            key={item.commentId}
          >
            <Avatar className="size-9">
              <AvatarFallback>
                {initials(item.author.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <header className="flex items-center justify-between gap-3 max-md:items-start max-md:flex-col">
                <div className="flex items-center gap-2 text-sm">
                  <strong>{item.author.displayName}</strong>
                  <span className="text-xs text-muted-foreground">
                    {item.kind === "reply" ? copy.comments.repliedToYou : copy.comments.postedComment}
                  </span>
                </div>
                <time className="text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </time>
              </header>
              <p className="my-2 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
              {item.parentComment && (
                <blockquote className="my-2 border-l-2 border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <strong>{item.parentComment.author.displayName}</strong>：
                  {item.parentComment.body}
                </blockquote>
              )}
              <Link
                className="inline-flex items-center gap-2 text-xs font-semibold"
                to={item.resourceHref}
              >
                <ResourceBadge type={item.resourceType} />
                {item.resourceName}
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
  return (
    <div className="space-y-5">
      <header className="mb-7">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {copy.comments.eyebrow}
        </span>
        <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">
          {copy.comments.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {copy.comments.description}
        </p>
      </header>
      <Tabs
        value={state.view}
        onValueChange={(value) => update({ view: value })}
      >
        <TabsList className="w-fit justify-start gap-12 rounded-none border-b border-border bg-transparent">
          <TabsTrigger
            value="replies"
            className="flex-none rounded-none border-b-2 border-transparent px-3.5 py-2.5 text-sm data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-foreground/60 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none"
          >
            <MessageCircleReply size={17} />
            {copy.comments.repliesTab}
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            className="flex-none rounded-none border-b-2 border-transparent px-3.5 py-2.5 text-sm data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:text-foreground/60 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none"
          >
            <MessagesSquare size={17} />
            {copy.comments.mineTab}
          </TabsTrigger>
        </TabsList>
        <div className="flex flex-wrap gap-4 py-4">
          <label className="flex items-center gap-2 text-xs font-semibold">
            {copy.comments.resourceType}
            <Select
              value={state.resourceType ?? "all"}
              onValueChange={(value) =>
                update({ resourceType: value === "all" ? undefined : value })
              }
            >
              <SelectTrigger size="sm" aria-label="资源类型">
                <SelectValue placeholder={commentResourceTypeOptions[0].label} />
              </SelectTrigger>
              <SelectContent>
                {commentResourceTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold">
            {copy.comments.sort}
            <Select
              value={state.sort}
              onValueChange={(value) => update({ sort: value })}
            >
              <SelectTrigger size="sm" aria-label="排序">
                <SelectValue placeholder={commentSortOptions[0].label} />
              </SelectTrigger>
              <SelectContent>
                {commentSortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <TabsContent value={state.view} className="mt-0">
          {list}
        </TabsContent>
      </Tabs>
      {query.data && query.data.total > query.data.pageSize && (
        <Pagination
          page={state.page}
          pageSize={query.data.pageSize}
          total={query.data.total}
          onChange={(page) => update({ page: String(page) })}
        />
      )}
    </div>
  );
}
