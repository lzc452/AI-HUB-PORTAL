import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceDetailView } from "@/components/common";
import { usePluginQuery } from "@/hooks";

export default function PluginDetailPage() {
  const { userId = "", pluginSlug = "" } = useParams();
  const query = usePluginQuery(userId, pluginSlug);
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载插件详情" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} message="插件不存在或当前账号没有查看权限。" /></main>;
  return <ResourceDetailView detail={query.data} />;
}
