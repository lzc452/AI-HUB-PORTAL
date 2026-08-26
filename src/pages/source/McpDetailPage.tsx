import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceDetailView } from "@/components/common";
import { useMcpQuery } from "@/hooks";

export default function McpDetailPage() {
  const { mcpSlug = "" } = useParams();
  const query = useMcpQuery(mcpSlug);
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label="正在加载 MCP 详情" /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} message="MCP 不存在或当前账号没有查看权限。" /></main>;
  return <ResourceDetailView detail={query.data} />;
}
