import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { copy } from "@/apis/static-data";
import { useLogout } from "@/hooks";
import type { PortalSetting } from "@/types";

const initial: PortalSetting = { emailNotification: true, reviewNotification: true, compactCards: false };

export default function SettingPage() {
  const [settings, setSettings] = useState(initial);
  const logout = useLogout();
  const toggle = (key: keyof PortalSetting) => setSettings((current) => ({ ...current, [key]: !current[key] }));
  return <div className="space-y-5"><header className="mb-7"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{copy.setting.eyebrow}</span><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{copy.setting.title}</h1><p className="mt-1 text-sm text-muted-foreground">{copy.setting.description}</p></header><Card className="gap-0 p-5 shadow-none"><h2 className="m-0 mb-2 text-base font-semibold">{copy.setting.notifications}</h2><SettingToggle title={copy.setting.emailTitle} description={copy.setting.emailDescription} checked={settings.emailNotification} onChange={() => toggle("emailNotification")} /><SettingToggle title={copy.setting.reviewTitle} description={copy.setting.reviewDescription} checked={settings.reviewNotification} onChange={() => toggle("reviewNotification")} /></Card><Card className="gap-0 p-5 shadow-none"><h2 className="m-0 mb-2 text-base font-semibold">{copy.setting.display}</h2><SettingToggle title={copy.setting.compactTitle} description={copy.setting.compactDescription} checked={settings.compactCards} onChange={() => toggle("compactCards")} /></Card><Card className="gap-0 p-5 shadow-none"><h2 className="m-0 mb-2 text-base font-semibold">{copy.setting.session}</h2><p className="m-0 text-sm text-muted-foreground">{copy.setting.sessionDescription}</p><Button variant="outline" className="mt-4" disabled={logout.isPending} onClick={() => logout.mutate()}>{copy.setting.logout}</Button></Card><div className="flex justify-end gap-2 max-md:flex-col"><Button onClick={() => toast.success(copy.setting.savedToast)}>{copy.setting.save}</Button><Button asChild variant="outline"><a href="/console/organization">{copy.setting.manageConsole}</a></Button></div></div>;
}

function SettingToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: () => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-5 border-t border-border py-4 first:border-t-0"><span className="flex flex-col gap-1"><strong className="text-sm">{title}</strong><small className="text-xs text-muted-foreground">{description}</small></span><Switch checked={checked} onCheckedChange={onChange} aria-label={title} /></label>;
}
