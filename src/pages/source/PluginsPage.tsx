import { resourceCategories } from "@/apis/static-data";
import { ResourceListView } from "@/components/common";
import { useListUrlState, usePluginsQuery } from "@/hooks";
import { useSourceStore } from "@/store";

export default function PluginsPage() {
  const { query } = useListUrlState();
  const result = usePluginsQuery(query);
  const display = useSourceStore((state) => state.display.plugin);
  const setDisplay = useSourceStore((state) => state.setDisplay);
  return <ResourceListView title="插件" description="将代码托管、知识库、数据平台与业务系统接入 AI Hub。" data={result.data} pending={result.isPending} error={result.isError} retry={() => result.refetch()} display={display} onDisplayChange={(value) => setDisplay("plugin", value)} categories={[...resourceCategories.plugin]} />;
}
