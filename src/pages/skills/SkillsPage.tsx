import { ResourceListView } from "@/components/common";
import { useListUrlState, useSkillsQuery } from "@/hooks";
import { useSkillsStore } from "@/store";

export default function SkillsPage() {
  const { query } = useListUrlState();
  const result = useSkillsQuery(query);
  const display = useSkillsStore((state) => state.display);
  const setDisplay = useSkillsStore((state) => state.setDisplay);
  return <ResourceListView title="全部技能" description="把经过验证的方法、约束与参考资料安装到你的 AI 工作流。" data={result.data} pending={result.isPending} error={result.isError} retry={() => result.refetch()} display={display} onDisplayChange={setDisplay} categories={["产品", "写作", "研发", "安全", "管理"]} />;
}
