import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceDetailView } from "@/components/common";
import { copy } from "@/apis/static-data";
import { useMcpQuery } from "@/hooks";

export default function McpDetailPage() {
  const { mcpSlug = "" } = useParams();
  const query = useMcpQuery(mcpSlug);
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label={copy.detailPages.loading("mcp")} /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} message={copy.detailPages.notFound("mcp")} /></main>;
  return <ResourceDetailView detail={query.data} />;
}
