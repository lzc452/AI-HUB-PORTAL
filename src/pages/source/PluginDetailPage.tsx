import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceDetailView } from "@/components/common";
import { copy } from "@/apis/static-data";
import { usePluginQuery } from "@/hooks";

export default function PluginDetailPage() {
  const { userId = "", pluginSlug = "" } = useParams();
  const query = usePluginQuery(userId, pluginSlug);
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label={copy.detailPages.loading("plugin")} /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} message={copy.detailPages.notFound("plugin")} /></main>;
  return <ResourceDetailView detail={query.data} />;
}
