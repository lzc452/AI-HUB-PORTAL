import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState, Pagination } from "@/components/common";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  useMarkAllPortalNotificationsRead,
  useMarkPortalNotificationRead,
  usePortalNotificationsList,
} from "@/hooks";
import type { PortalNotificationRecord } from "@/apis";

const PAGE_SIZE = 10;

function formatRelativeTime(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}

function NotificationItem({
  record,
  onOpen,
}: {
  record: PortalNotificationRecord;
  onOpen: (record: PortalNotificationRecord) => void;
}) {
  const isUnread = record.readAt === null;
  return (
    <button
      type="button"
      className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-zinc-50"
      onClick={() => onOpen(record)}
    >
      <span
        aria-hidden="true"
        className={`mt-1.5 block size-2 shrink-0 rounded-full ${isUnread ? "bg-blue-600" : "bg-transparent"}`}
      />
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm ${isUnread ? "font-semibold" : "text-zinc-600"}`}>
          {record.payload?.title ?? record.message}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {record.payload?.body ?? record.message}
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {formatRelativeTime(record.createdAt)}
      </span>
    </button>
  );
}

export default function NotificationsPage() {
  const listQuery = usePortalNotificationsList();
  const markRead = useMarkPortalNotificationRead();
  const markAllRead = useMarkAllPortalNotificationsRead();
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PortalNotificationRecord | null>(null);

  const records = listQuery.data ?? [];
  const unreadIds = useMemo(
    () =>
      (listQuery.data ?? [])
        .filter((item) => item.readAt === null)
        .map((item) => item.notificationId),
    [listQuery.data],
  );
  const filtered = tab === "unread" ? records.filter((item) => item.readAt === null) : records;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openRecord = (record: PortalNotificationRecord) => {
    setSelected(record);
    if (record.readAt === null) markRead.mutate(record.notificationId);
  };

  if (listQuery.isPending) return <LoadingState label="通知加载中" />;
  if (listQuery.isError || !listQuery.data) {
    return <ErrorState retry={() => listQuery.refetch()} />;
  }

  return (
    <div className="space-y-5">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            个人中心
          </span>
          <h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">消息通知</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            审核进展、需求动态与系统消息都会在这里通知你。
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={unreadIds.length === 0 || markAllRead.isPending}
          onClick={() => markAllRead.mutate()}
        >
          {markAllRead.isPending ? "标记中…" : "全部标记已读"}
        </Button>
      </header>

      <ToggleGroup
        type="single"
        value={tab}
        onValueChange={(value) => {
          if (value === "all" || value === "unread") {
            setTab(value);
            setPage(1);
          }
        }}
        variant="outline"
        size="sm"
        aria-label="通知筛选"
      >
        <ToggleGroupItem value="all">全部（{records.length}）</ToggleGroupItem>
        <ToggleGroupItem value="unread">未读（{unreadIds.length}）</ToggleGroupItem>
      </ToggleGroup>

      {filtered.length === 0 ? (
        <EmptyState
          title={tab === "unread" ? "没有未读通知" : "暂无通知"}
          description={tab === "unread" ? "新的通知会出现在这里。" : "触发审核、需求或系统事件后会在这里收到通知。"}
        />
      ) : (
        <Card className="gap-0 p-0 shadow-none">
          {paged.map((record) => (
            <NotificationItem key={record.notificationId} record={record} onOpen={openRecord} />
          ))}
        </Card>
      )}

      {filtered.length > PAGE_SIZE && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onChange={setPage}
        />
      )}

      {selected !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="通知详情"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold">
                  {selected.payload?.title ?? selected.message}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatRelativeTime(selected.createdAt)}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-700">
              {selected.payload?.body ?? selected.message}
            </p>
            {selected.payload?.detail !== undefined &&
            Object.keys(selected.payload.detail).length > 0 ? (
              <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                {Object.entries(selected.payload.detail).map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 truncate text-zinc-700">
                      {typeof value === "string" ? value : JSON.stringify(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                关闭
              </Button>
              <Button type="button" onClick={() => setSelected(null)}>
                知道了
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
