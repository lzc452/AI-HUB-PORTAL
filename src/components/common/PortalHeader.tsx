import { Bell, Menu, Plus, UserRound, X } from "lucide-react";
import { useState } from "react";
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
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "应用", href: "/apps?sortBy=score", children: [{ label: "全部应用", href: "/apps?sortBy=score" }, { label: "应用猎手", href: "/apps-hunt" }, { label: "部门中心", href: "/department-zone" }] },
  { label: "技能", href: "/skills", children: [{ label: "全部技能", href: "/skills" }, { label: "技能包", href: "/skillpackage" }] },
  { label: "资源", href: "/plugins", children: [{ label: "插件", href: "/plugins" }, { label: "MCP", href: "/mcp" }] },
  { label: "文档", href: "/tutorials", children: [{ label: "使用指南", href: "/tutorials" }, { label: "更新日志", href: "/updates" }, { label: "关于我们", href: "/about" }] },
] as const;

const mobileNavItems = navItems.reduce<Array<{ label: string; href: string }>>((items, group) => [...items, ...group.children], []);

export function PortalHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-[61px] border-b border-black/5 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-full w-[min(1280px,calc(100%-48px))] items-center justify-between max-[767px]:w-[calc(100%-28px)]">
        <Link className="inline-flex items-center gap-2.5 text-[17px] font-extrabold tracking-[-0.03em]" to="/" aria-label="AI Hub Portal 首页">
          <span className="size-7 overflow-hidden rounded-lg bg-white"><img className="size-full object-cover" src={logoUrl} alt="" /></span>
          <span>AI Hub</span>
        </Link>

        <NavigationMenu className="hidden min-[901px]:flex" viewport={false}>
          <NavigationMenuList className="gap-3">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuTrigger className="h-[38px] px-3 text-sm font-normal text-muted-foreground hover:text-foreground">
                  {item.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="w-44">
                  <div className="grid gap-1">
                    {item.children.map((child) => <NavigationMenuLink key={child.href} asChild><NavLink to={child.href} className="rounded-md px-2.5 py-2 text-sm">{child.label}</NavLink></NavigationMenuLink>)}
                  </div>
                </NavigationMenuContent>
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
