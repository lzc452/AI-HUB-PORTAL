import { z } from "zod";

export const contentPageSlugSchema = z.enum(["tutorials", "about", "updates"]);
