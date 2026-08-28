import { resourceCategories } from "@/apis/static-data";
import { ResourceListView } from "@/components/common";
import { useAppsQuery, useListUrlState } from "@/hooks";
import { useAppsStore } from "@/store";

export default function AppsPage() {
  const { query } = useListUrlState();
  const result = useAppsQuery(query);
  const display = useAppsStore((state) => state.display);
  const setDisplay = useAppsStore((state) => state.setDisplay);
  return (
    <ResourceListView
      title="全部应用"
      description="发现经过审核和安全扫描、可在企业内直接使用的 AI 应用。"
      data={result.data}
      pending={result.isPending}
      error={result.isError}
      retry={() => result.refetch()}
      display={display}
      onDisplayChange={setDisplay}
      categories={[...resourceCategories.app]}
    />
  );
}
