import { listQuerySchema } from "@/schemas/common";

export const appsListQuerySchema = listQuerySchema;
export const departmentSearchSchema = listQuerySchema.pick({ q: true, page: true, pageSize: true });
