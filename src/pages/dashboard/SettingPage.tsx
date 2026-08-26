import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PortalSetting } from "@/types";

const initial: PortalSetting = { emailNotification: true, reviewNotification: true, compactCards: false };

export default function SettingPage() {
  const [settings, setSettings] = useState(initial);
  const toggle = (key: keyof PortalSetting) => setSettings((current) => ({ ...current, [key]: !current[key] }));
  return <div className="space-y-5"><header className="mb-7"><span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Preferences</span><h1 className="mt-1 text-3xl font-semibold tracking-[-0.04em]">设置</h1><p className="mt-1 text-sm text-muted-foreground">调整 Portal 的通知和显示偏好；企业身份与权限由统一控制台管理。</p></header><Card className="gap-0 p-5 shadow-none"><h2 className="m-0 mb-2 text-base font-semibold">消息通知</h2><SettingToggle title="邮件通知" description="接收资源审核、回复和安全扫描结果。" checked={settings.emailNotification} onChange={() => toggle("emailNotification")} /><SettingToggle title="审核进度通知" description="资源状态变化时通过企业消息提醒。" checked={settings.reviewNotification} onChange={() => toggle("reviewNotification")} /></Card><Card className="gap-0 p-5 shadow-none"><h2 className="m-0 mb-2 text-base font-semibold">显示偏好</h2><SettingToggle title="紧凑资源卡片" description="在支持的列表中减少卡片高度，显示更多内容。" checked={settings.compactCards} onChange={() => toggle("compactCards")} /></Card><div className="flex justify-end gap-2 max-md:flex-col"><Button onClick={() => toast.success("设置已保存")}>保存设置</Button><Button asChild variant="outline"><a href="/console/organization">管理企业身份与权限</a></Button></div></div>;
}

function SettingToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: () => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-5 border-t border-border py-4 first:border-t-0"><span className="flex flex-col gap-1"><strong className="text-sm">{title}</strong><small className="text-xs text-muted-foreground">{description}</small></span><Switch checked={checked} onCheckedChange={onChange} aria-label={title} /></label>;
}
