import { z } from "zod";

export const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  sortBy: z.enum(["score", "downloads", "updatedAt"]).default("score"),
  category: z.string().trim().max(50).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const resourceTypeSchema = z.enum(["app", "skill", "plugin", "mcp"]);
