import { resourceCategories } from "@/apis/static-data";
import { ResourceListView } from "@/components/common";
import { useListUrlState, useMcpsQuery } from "@/hooks";
import { useSourceStore } from "@/store";

export default function McpsPage() {
  const { query } = useListUrlState();
  const result = useMcpsQuery(query);
  const display = useSourceStore((state) => state.display.mcp);
  const setDisplay = useSourceStore((state) => state.setDisplay);
  return <ResourceListView title="MCP" description="发现可由 AI 安全调用的企业工具、数据与服务连接。" data={result.data} pending={result.isPending} error={result.isError} retry={() => result.refetch()} display={display} onDisplayChange={(value) => setDisplay("mcp", value)} categories={[...resourceCategories.mcp]} />;
}
