import { z } from "zod";

export const IngredientModelSchema = z.object({
    id: z.string(),
    name: z.string().nonempty("Name can not be empty"),
    amount: z.number("Name can not be empty"),
    unit: z.string().nonempty("Unit can not be empty"),
    kcal: z.number().default(0),
    sortOrder: z.number().min(1),
    recipeSectionId: z.string()
})

export type IngredientModel = z.infer<typeof IngredientModelSchema>