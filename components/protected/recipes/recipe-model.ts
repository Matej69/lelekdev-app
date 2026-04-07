import { z } from "zod";
import { RecipeSectionSchema } from "./sections/recipe-section-schema";

export const RecipeSchema = z.object({
  id: z.string(),
  name: z.string().nonempty("Name must be defined").default(""),
  ownerId: z.string().nonempty(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color"),
  sortOrder: z.number().min(1),
  sections: z.array(RecipeSectionSchema).default([]),
  isNew: z.boolean().default(false)
})

export type RecipeModel = z.infer<typeof RecipeSchema>