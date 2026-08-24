export interface DetailTab { key: string; label: string; }

export function DetailTabs({ tabs, active, onChange }: { tabs: DetailTab[]; active: string; onChange: (value: string) => void }) {
  return (
    <div className="detail-tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.key} role="tab" aria-selected={active === tab.key} className={active === tab.key ? "is-active" : ""} onClick={() => onChange(tab.key)}>{tab.label}</button>
      ))}
    </div>
  );
}
