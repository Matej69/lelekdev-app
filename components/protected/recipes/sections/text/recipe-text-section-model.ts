import { z } from "zod";
import { RecipeSectionType } from "../type";

export const RecipeTextSectionModelSchema = z.object({  
    id: z.string(),
    type: z.literal(RecipeSectionType.TEXT),
    recipeId: z.string().nonempty(),
    title: z.string(),
    content: z.string().nonempty("Content can not be empty"),
    sortOrder: z.number().min(1)
})

export type RecipeTextSectionModel = z.infer<typeof RecipeTextSectionModelSchema>