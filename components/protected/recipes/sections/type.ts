import { z } from "zod";

export const RecipeSectionType = {
    TEXT: 'TEXT',
    INGREDIENTS: 'INGREDIENTS'
} as const

export const RecipeSectionTypeSchema = z.enum([
  RecipeSectionType.TEXT,
  RecipeSectionType.INGREDIENTS,
])

export type RecipeSectionType = z.infer<typeof RecipeSectionTypeSchema>