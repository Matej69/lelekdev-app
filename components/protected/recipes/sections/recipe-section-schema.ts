import { z } from "zod";
import { RecipeTextSectionModelSchema } from "./text/recipe-text-section-model";
import { RecipeIngredientSectionModelSchema } from "./ingredient/recipe-ingredient-section-model";

export const RecipeSectionSchema = z.discriminatedUnion("type", [
  RecipeTextSectionModelSchema,
  RecipeIngredientSectionModelSchema,
])

export type RecipeSection = z.infer<typeof RecipeSectionSchema>