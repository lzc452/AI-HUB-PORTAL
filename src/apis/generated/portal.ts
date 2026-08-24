/**
 * Portal OpenAPI 引导类型。连接 API 后运行 `npm run generate:api` 会用服务端
 * OpenAPI 文档覆盖本文件，并保持 `@/apis/openapi` 的客户端接口不变。
 */
export interface paths {
  "/internal/portal/dashboard/comments": {
    get: {
      parameters: {
        query?: {
          view?: "replies" | "mine";
          resourceType?: "app" | "skill" | "plugin" | "mcp";
          sort?: "latest" | "oldest";
          page?: number;
          pageSize?: number;
        };
      };
      responses: { 200: { content: { "application/json": unknown } } };
    };
  };
}
