import type { PublishStatus } from "@/types";

export const publishStatusLabel = (status: PublishStatus) => ({ draft: "草稿", scanning: "安全扫描", pending_review: "审核中", published: "已发布", rejected: "已退回", withdrawn: "已撤回" })[status];
