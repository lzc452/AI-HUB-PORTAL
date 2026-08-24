import { useState } from "react";
import type { PortalSetting } from "@/types";
import { useUiStore } from "@/store";

const initial: PortalSetting = { emailNotification: true, reviewNotification: true, compactCards: false };

export default function SettingPage() {
  const [settings, setSettings] = useState(initial);
  const toast = useUiStore((state) => state.showToast);
  const toggle = (key: keyof PortalSetting) => setSettings((current) => ({ ...current, [key]: !current[key] }));
  return <div className="dashboard-page settings-page"><header className="dashboard-page-heading"><div><span className="portal-kicker">Preferences</span><h1>设置</h1><p>调整 Portal 的通知和显示偏好；企业身份与权限由统一控制台管理。</p></div></header><section className="settings-panel"><h2>消息通知</h2><SettingToggle title="邮件通知" description="接收资源审核、回复和安全扫描结果。" checked={settings.emailNotification} onChange={() => toggle("emailNotification")} /><SettingToggle title="审核进度通知" description="资源状态变化时通过企业消息提醒。" checked={settings.reviewNotification} onChange={() => toggle("reviewNotification")} /></section><section className="settings-panel"><h2>显示偏好</h2><SettingToggle title="紧凑资源卡片" description="在支持的列表中减少卡片高度，显示更多内容。" checked={settings.compactCards} onChange={() => toggle("compactCards")} /></section><div className="settings-actions"><button className="portal-button portal-button--primary" onClick={() => toast("设置已保存", "success")}>保存设置</button><a className="portal-button" href="/console/organization">管理企业身份与权限</a></div></div>;
}

function SettingToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: () => void }) {
  return <label className="setting-row"><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={onChange} /><i aria-hidden="true" /></label>;
}
