import { Bell, Menu, Plus, UserRound, X } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { Link, NavLink } from "react-router-dom";
import logoUrl from "@/assets/ai-hub-logo.png";
import { Button } from "@/components/ui/button";
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

const navItems = [
  {
    label: "应用",
    href: "/apps?sortBy=score",
    children: [
      { label: "全部应用", description: "发现经过审核与安全扫描、可在企业内直接使用的 AI 应用。", href: "/apps?sortBy=score" },
      { label: "应用猎手", description: "用员工真实投票形成每周榜单，让优秀实践更快进入团队。", href: "/apps-hunt" },
      { label: "部门中心", description: "从业务团队的真实使用经验中发现更合适的资源。", href: "/department-zone" },
    ],
  },
  {
    label: "技能",
    href: "/skills",
    children: [
      { label: "全部技能", description: "把可靠的方法、约束和参考资料封装为可复用能力。", href: "/skills" },
      { label: "技能包", description: "按真实任务将多个 Skills 组织为完整工作流。", href: "/skillpackage" },
    ],
  },
  {
    label: "资源",
    href: "/plugins",
    children: [
      { label: "插件", description: "从代码托管、知识库到数据平台，选择受控的连接能力。", href: "/plugins" },
      { label: "MCP", description: "以 MCP 协议透明、可审计地连接企业数据与工具。", href: "/mcp" },
    ],
  },
  {
    label: "文档",
    href: "/tutorials",
    children: [
      { label: "使用指南", description: "图文与示例驱动的上手教程，从入门到进阶。", href: "/tutorials" },
      { label: "更新日志", description: "跟随每次更新，了解 Portal 的新能力与修复。", href: "/updates" },
      { label: "关于我们", description: "了解 AI Hub Portal 如何把 AI 能力带到每个人的工作中。", href: "/about" },
    ],
  },
] as const;

const mobileNavItems = navItems.reduce<Array<{ label: string; href: string }>>((items, group) => [...items, ...group.children], []);

export function PortalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hoverOriginX = useRef(0);
  const hoveredLabelRef = useRef<string | null>(null);

  // 面板从当前划过的主菜单元素正下方展开：把缩放原点对齐到触发项中心。
  // radix 的 viewport 在悬停意图延迟后才挂载，因此通过 ref 回调在挂载瞬间写入原点。
  const alignViewportToTrigger = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    hoverOriginX.current = Math.round(rect.left + rect.width / 2);
    hoveredLabelRef.current = event.currentTarget.textContent ?? null;
  };

  const attachViewport = (node: HTMLDivElement | null) => {
    viewportRef.current = node;
    if (node && hoveredLabelRef.current) node.style.transformOrigin = `${hoverOriginX.current}px top`;
  };

  return (
    <header className="sticky top-0 z-50 h-[61px] border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full w-[min(1280px,calc(100%-48px))] items-center justify-between max-[767px]:w-[calc(100%-28px)]">
        <Link className="inline-flex items-center gap-2.5 text-[17px] font-extrabold tracking-[-0.03em]" to="/" aria-label="AI Hub Portal 首页">
          <span className="size-7 overflow-hidden rounded-lg bg-white"><img className="size-full object-cover" src={logoUrl} alt="" /></span>
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
            {navItems.map((item) => (
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
                              <NavLink to={child.href} className="group rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-zinc-50/80">
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
                    <NavLink to={item.href} className={cn(navigationMenuTriggerStyle(), "h-[38px] px-3 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground")}>
                      {item.label}
                    </NavLink>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3 max-[767px]:gap-0.5">
          <Button asChild className="h-[38px] rounded-full px-4 text-sm font-semibold max-[900px]:hidden"><Link to="/dashboard/publish"><Plus size={15} />发布</Link></Button>
          <Button variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:text-foreground" aria-label="通知"><Bell size={18} /></Button>
          <Button asChild variant="ghost" size="icon" className="size-9 rounded-full text-muted-foreground hover:text-foreground" aria-label="个人中心"><Link to="/dashboard"><UserRound size={18} /></Link></Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden size-9 rounded-full text-muted-foreground hover:text-foreground max-[900px]:inline-flex" aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}>
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm p-6">
              <SheetHeader className="text-left">
                <SheetTitle>AI Hub</SheetTitle>
                <SheetDescription className="sr-only">移动端主导航</SheetDescription>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1" aria-label="移动端导航">
                {mobileNavItems.map((item) => <Link className="flex min-h-12 items-center border-b border-border text-base font-semibold" key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>)}
                <Link className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground" to="/dashboard/publish" onClick={() => setMobileMenuOpen(false)}><Plus size={15} />发布资源</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
