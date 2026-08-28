import { useParams } from "react-router-dom";
import { ErrorState, LoadingState, ResourceDetailView } from "@/components/common";
import { copy } from "@/apis/static-data";
import { useSkillQuery } from "@/hooks";

export default function SkillDetailPage() {
  const { userId = "", skillSlug = "" } = useParams();
  const query = useSkillQuery(userId, skillSlug);
  if (query.isPending) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><LoadingState label={copy.detailPages.loading("skill")} /></main>;
  if (query.isError || !query.data) return <main className="mx-auto min-h-[calc(100vh-61px)] w-[min(1180px,calc(100%-48px))] py-12 max-md:w-[calc(100%-28px)]"><ErrorState retry={() => query.refetch()} message={copy.detailPages.notFound("skill")} /></main>;
  return <ResourceDetailView detail={query.data} />;
}
