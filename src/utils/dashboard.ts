import { publishStatusLabels } from "@/apis/static-data";
import type { PublishStatus } from "@/types";

/** 静态映射统一在 src/apis/static-data.ts 管理。 */
export const publishStatusLabel = (status: PublishStatus) => publishStatusLabels[status];
