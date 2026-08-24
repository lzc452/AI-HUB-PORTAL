import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceDetailView } from "@/components/common";
import { useAppQuery } from "@/hooks";

export default function AppDetailPage() {
  const { userId = "", appSlug = "" } = useParams();
  const query = useAppQuery(userId, appSlug);
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载应用详情" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} message="应用不存在或当前账号没有查看权限。" /></main>;
  return <ResourceDetailView detail={query.data} />;
}
