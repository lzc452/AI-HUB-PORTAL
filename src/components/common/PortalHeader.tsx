import { Bell, ChevronDown, Menu, Plus, UserRound, X } from "lucide-react";
import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import logoUrl from "@/assets/ai-hub-logo.png";
import { useUiStore } from "@/store";

const navItems = [
  { label: "应用", href: "/apps?sortBy=score", children: [{ label: "全部应用", href: "/apps?sortBy=score" }, { label: "应用猎手", href: "/apps-hunt" }, { label: "部门中心", href: "/department-zone" }] },
  { label: "技能", href: "/skills", children: [{ label: "全部技能", href: "/skills" }, { label: "技能包", href: "/skillpackage" }] },
  { label: "资源", href: "/plugins", children: [{ label: "插件", href: "/plugins" }, { label: "MCP", href: "/mcp" }] },
  { label: "文档", href: "/tutorials", children: [{ label: "使用指南", href: "/tutorials" }, { label: "更新日志", href: "/updates" }, { label: "关于我们", href: "/about" }] },
] as const;

const mobileNavItems = navItems.reduce<Array<{ label: string; href: string }>>((items, group) => [...items, ...group.children], []);

export function PortalHeader() {
  const mobileMenuOpen = useUiStore((state) => state.mobileMenuOpen);
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <header className="portal-header">
      <div className="portal-header__inner">
        <Link className="portal-brand" to="/" aria-label="AI Hub Portal 首页">
          <span className="portal-brand__mark"><img src={logoUrl} alt="" /></span>
          <span>AI Hub</span>
        </Link>
        <nav className="portal-nav" aria-label="主导航">
          {navItems.map((item) => (
            <div className="portal-nav__group" key={item.label}>
              <NavLink to={item.href}>{item.label}<ChevronDown size={13} /></NavLink>
              <div className="portal-nav__dropdown">
                {item.children.map((child) => <Link key={child.href} to={child.href}>{child.label}</Link>)}
              </div>
            </div>
          ))}
        </nav>
        <div className="portal-header__actions">
          <Link className="portal-button portal-button--primary portal-header__publish" to="/dashboard/publish"><Plus size={15} />发布</Link>
          <button className="portal-icon-button" aria-label="通知"><Bell size={18} /></button>
          <Link className="portal-icon-button" to="/dashboard" aria-label="个人中心"><UserRound size={18} /></Link>
          <button className="portal-icon-button portal-menu-button" aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <nav className="portal-mobile-nav" aria-label="移动端导航">
          {mobileNavItems.map((item) => (
            <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>
          ))}
          <Link to="/dashboard/publish" onClick={() => setMobileMenuOpen(false)}>发布资源</Link>
        </nav>
      )}
    </header>
  );
}
