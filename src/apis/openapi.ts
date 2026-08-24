import createClient from "openapi-fetch";
import type { paths } from "@/apis/generated/portal";

/** 由 AI Hub OpenAPI 文档约束的底层客户端，业务页面只通过各领域 apis 文件调用。 */
export const portalOpenApi = createClient<paths>({
  baseUrl: "",
  credentials: "same-origin",
});
