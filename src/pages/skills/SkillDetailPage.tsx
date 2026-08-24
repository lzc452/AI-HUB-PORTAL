import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceDetailView } from "@/components/common";
import { useSkillQuery } from "@/hooks";

export default function SkillDetailPage() {
  const { userId = "", skillSlug = "" } = useParams();
  const query = useSkillQuery(userId, skillSlug);
  if (query.isPending) return <main className="portal-page portal-container"><LoadingState label="正在加载技能详情" /></main>;
  if (query.isError || !query.data) return <main className="portal-page portal-container"><ErrorState retry={() => query.refetch()} message="技能不存在或当前账号没有查看权限。" /></main>;
  return <ResourceDetailView detail={query.data} />;
}
