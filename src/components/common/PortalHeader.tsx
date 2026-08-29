import { Bell, LogOut, Menu, Plus, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoUrl from "@/assets/ai-hub-logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { portalMobileNavItems, portalNavItems } from "@/apis/static-data";
import {
  useCurrentActor,
  useLogout,
  useMarkPortalNotificationRead,
  usePortalNotificationsList,
  usePortalUnreadCount,
  useRequireLogin,
} from "@/hooks";
import { useLoginDialogStore } from "@/store";
import { currentReturnTo } from "@/utils";

/** 头部铃铛下拉：最近 5 条未读 + 查看全部；点击条目标记已读。 */
function NotificationBell({ requireLogin }: { requireLogin: (onSuccess?: () => void) => boolean }) {
  const actor = useCurrentActor();
  const navigate = useNavigate();
  const unreadQuery = usePortalUnreadCount();
  const listQuery = usePortalNotificationsList();
  const markRead = useMarkPortalNotificationRead();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const unreadCount = unreadQuery.data?.unreadCount ?? 0;
  const recentUnread = (listQuery.data ?? []).filter((item) => item.readAt === null).slice(0, 5);

  const openBell = () => {
    if (!actor.data) {
      requireLogin(() => navigate("/dashboard/notifications"));
      return;
    }
    setOpen((current) => !current);
  };

  const openRecord = (notificationId: string) => {
    if (recentUnread.some((item) => item.notificationId === notificationId)) {
      markRead.mutate(notificationId);
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative size-9 rounded-full text-muted-foreground hover:text-foreground"
        aria-label="通知"
        aria-expanded={open}
        onClick={openBell}
      >
        <Bell size={18} />
        {actor.data && unreadCount > 0 ? (
          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] font-semibold leading-4">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        ) : null}
      </Button>
      {open ? (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_60px_-30px_rgba(28,28,30,0.35)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">消息通知</span>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/dashboard/notifications")}
            >
              查看全部
            </button>
          </div>
          {recentUnread.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">暂无新通知</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {recentUnread.map((item) => (
                <li key={item.notificationId} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left transition-colors hover:bg-zinc-50"
                    onClick={() => openRecord(item.notificationId)}
                  >
                    <span className="block truncate text-sm font-medium text-zinc-950">
                      {item.payload?.title ?? item.message}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {item.payload?.body ?? item.message}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-sm"
              onClick={() => navigate("/dashboard/notifications")}
            >
              查看全部通知
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PortalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hoverOriginX = useRef(0);
  const hoveredLabelRef = useRef<string | null>(null);
  const requireLogin = useRequireLogin();
  const navigate = useNavigate();

  // 面板从当前划过的主菜单元素正下方展开：把缩放原点对齐到触发项中心。
  // radix 的 viewport 在悬停意图延迟后才挂载，因此通过 ref 回调在挂载瞬间写入原点。
  const alignViewportToTrigger = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    hoverOriginX.current = Math.round(rect.left + rect.width / 2);
    hoveredLabelRef.current = event.currentTarget.textContent ?? null;
  };

  const attachViewport = (node: HTMLDivElement | null) => {
    viewportRef.current = node;
    if (node && hoveredLabelRef.current)
      node.style.transformOrigin = `${hoverOriginX.current}px top`;
  };

  return (
    <header className="sticky top-0 z-50 h-[61px] border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full w-[min(1280px,calc(100%-48px))] items-center justify-between max-[767px]:w-[calc(100%-28px)]">
        <Link
          className="inline-flex items-center gap-2.5 text-[17px] font-extrabold tracking-[-0.03em]"
          to="/"
          aria-label="AI Hub Portal 首页"
        >
          <span className="size-7 overflow-hidden rounded-lg bg-white">
            <img className="size-full object-cover" src={logoUrl} alt="" />
          </span>
          <span>AI Hub</span>
        </Link>

        <NavigationMenu
          className="hidden h-full min-[901px]:flex"
          viewportProps={{
            ref: attachViewport,
            className:
              "mt-0 w-full max-w-none md:w-full rounded-b-2xl border-y border-black/5 bg-white/90 text-zinc-950 shadow-[0_24px_60px_-30px_rgba(28,28,30,0.35)] backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2",
          }}
        >
          <NavigationMenuList className="gap-3">
            {portalNavItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                {item.children.length > 0 ? (
                  <>
                    <NavigationMenuTrigger
                      onPointerEnter={alignViewportToTrigger}
                      className="h-[38px] px-3 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground data-[state=open]:bg-transparent data-[state=open]:text-foreground data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent"
                    >
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="w-full p-0 md:w-full data-[motion=from-end]:slide-in-from-right-0 data-[motion=from-start]:slide-in-from-left-0 data-[motion=to-end]:slide-out-to-right-0 data-[motion=to-start]:slide-out-to-left-0">
                      <div className="mx-auto w-[min(1180px,calc(100%-48px))] px-4 py-8">
                        <div className="grid grid-cols-2 gap-x-10 gap-y-4 max-[1100px]:gap-x-7">
                          {item.children.map((child) => (
                            <NavigationMenuLink key={child.href} asChild>
                              <NavLink
                                to={child.href}
                                className="group rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-zinc-50/80"
                              >
                                <span className="block text-[15px] font-bold tracking-[-0.01em] text-zinc-950 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-blue-600">
                                  {child.label}
                                </span>
                                <span className="mt-1 block max-w-sm text-[13px] font-normal leading-relaxed text-zinc-500">
                                  {child.description}
                                </span>
                              </NavLink>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <NavLink
                      to={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "h-[38px] px-3 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </NavLink>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3 max-[767px]:gap-0.5">
          <Button
            type="button"
            className="h-[38px] rounded-full px-4 text-sm font-semibold max-[900px]:hidden"
            onClick={() => requireLogin(() => navigate("/dashboard/publish"))}
          >
            <Plus size={15} />
            发布
          </Button>
          <NotificationBell requireLogin={requireLogin} />
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="个人中心"
            onClick={() => requireLogin(() => navigate("/dashboard"))}
          >
            <UserRound size={18} />
          </Button>
          <AccountActions />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden size-9 rounded-full text-muted-foreground hover:text-foreground max-[900px]:inline-flex"
                aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm p-6">
              <SheetHeader className="text-left">
                <SheetTitle>AI Hub</SheetTitle>
                <SheetDescription className="sr-only">
                  移动端主导航
                </SheetDescription>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1" aria-label="移动端导航">
                {portalMobileNavItems.map((item) => (
                  <Link
                    className="flex min-h-12 items-center border-b border-border text-base font-semibold"
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  type="button"
                  className="mt-3 min-h-11 rounded-md px-4 text-sm font-semibold"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    requireLogin(() => navigate("/dashboard/publish"));
                  }}
                >
                  <Plus size={15} />
                  发布资源
                </Button>
                <AccountActions
                  mobile
                  onSignedOut={() => setMobileMenuOpen(false)}
                />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function AccountActions({
  mobile = false,
  onSignedOut,
}: {
  mobile?: boolean;
  onSignedOut?: () => void;
}) {
  const actor = useCurrentActor();
  const logoutMutation = useLogout();
  const openLoginDialog = useLoginDialogStore((s) => s.openLoginDialog);
  const signOut = () =>
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        onSignedOut?.();
      },
    });
  return (
    <div
      className={cn(
        "items-center gap-2",
        mobile
          ? "mt-5 flex border-t border-border pt-4"
          : "hidden min-[901px]:flex",
      )}
    >
      {actor.isPending ? null : actor.isError ? (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "rounded-full text-sm font-semibold",
            mobile ? "w-full gap-2" : "h-[38px] px-4",
          )}
          onClick={() => openLoginDialog({ returnTo: currentReturnTo() })}
        >
          <UserRound size={15} />
          登录
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size={mobile ? "default" : "icon"}
          className={cn(
            "rounded-full text-muted-foreground hover:text-foreground",
            mobile ? "gap-2" : "size-9",
          )}
          aria-label="退出登录"
          disabled={logoutMutation.isPending}
          onClick={signOut}
        >
          <LogOut size={16} />
          {mobile && "退出登录"}
        </Button>
      )}
    </div>
  );
}
