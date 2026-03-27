import { z } from "zod";
import { RecipeSectionType } from "../type";

export const RecipeTextSectionModelSchema = z.object({  
    id: z.string(),
    type: z.literal(RecipeSectionType.TEXT),
    recipeId: z.string().nonempty(),
    title: z.string({ error: "Title is required" }).nonempty("Title can not be empty"),
    content: z.string().nonempty("Content can not be empty"),
    sortOrder: z.number().min(1),
    isNew: z.boolean().default(false)
})

export type RecipeTextSectionModel = z.infer<typeof RecipeTextSectionModelSchema>