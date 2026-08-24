import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceDetailView } from "@/components/common";
import { useMcpQuery } from "@/hooks";

export default function McpDetailPage() {
  const { mcpSlug = "" } = useParams();
  const query = useMcpQuery(mcpSlug);
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载 MCP 详情" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} message="MCP 不存在或当前账号没有查看权限。" /></main>;
  return <ResourceDetailView detail={query.data} />;
}
