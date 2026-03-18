import { z } from "zod";
import { RecipeSectionType, RecipeSectionTypeSchema } from "../type";
import { IngredientModelSchema } from "./ingredient-model";

export const RecipeIngredientSectionModelSchema = z.object({  
    id: z.string(),
    type: z.literal(RecipeSectionType.INGREDIENTS),
    recipeId: z.string().nonempty(),
    title: z.string().default(""),
    ingredients: z.array(IngredientModelSchema).default([]),
    sortOrder: z.number().min(1),
    linkedAmountUpdate: z.boolean().default(false)
})

export type RecipeIngredientSectionModel = z.infer<typeof RecipeIngredientSectionModelSchema>