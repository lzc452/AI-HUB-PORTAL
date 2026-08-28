import { Link } from "react-router-dom";
import { copy, footerLinks } from "@/apis/static-data";

export function PortalFooter() {
  return (
    <footer className="border-t border-border py-10 text-[13px] text-muted-foreground">
      <div className="mx-auto grid w-[min(1180px,calc(100%-48px))] grid-cols-[2fr_1fr_1fr] gap-16 max-md:w-[calc(100%-28px)] max-md:grid-cols-1 max-md:gap-7">
        <div>
          <strong className="text-lg text-foreground">{copy.footer.brand}</strong>
          <p className="max-w-[480px] leading-relaxed">{copy.footer.tagline}</p>
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-1 text-sm text-foreground">{copy.footer.quickEntry}</h3>
          {footerLinks.quick.map((link) => (
            <Link className="hover:text-foreground" to={link.href} key={link.href}>{link.label}</Link>
          ))}
        </div>
        <div className="flex flex-col items-start gap-2">
          <h3 className="mb-1 text-sm text-foreground">{copy.footer.workspace}</h3>
          {footerLinks.workspace.map((link) => (
            <Link className="hover:text-foreground" to={link.href} key={link.href}>{link.label}</Link>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 w-[min(1180px,calc(100%-48px))] border-t border-border pt-4 max-md:w-[calc(100%-28px)]">{copy.footer.copyright}</div>
    </footer>
  );
}
