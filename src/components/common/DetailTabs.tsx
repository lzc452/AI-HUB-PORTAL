import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface DetailTab { key: string; label: string; }

export function DetailTabs({ tabs }: { tabs: DetailTab[] }) {
  return (
    <TabsList className="h-auto w-full justify-start gap-7 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
      {tabs.map((tab) => (
        <TabsTrigger key={tab.key} value={tab.key} className="h-12 shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-0 text-sm text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none">{tab.label}</TabsTrigger>
      ))}
    </TabsList>
  );
}
