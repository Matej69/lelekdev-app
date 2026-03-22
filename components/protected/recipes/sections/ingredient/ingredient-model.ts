import { z } from "zod";

export const IngredientModelSchema = z.object({
    id: z.string(),
    name: z.string().nonempty("Name can not be empty"),
    amount: z.number()
  .gt(0, { message: "Amount must be greater than 0" })
  .refine((val) => {
    const [int, dec] = val.toString().split(".");
    // max 8 digits before decimal, max 2 after
    return int.length <= 8 && (!dec || dec.length <= 2);
  }, {
    message: "Amount must have maximum of 8 integer values and 2 fractional values",
  }),
    unit: z.string().nonempty("Unit can not be empty"),
    kcal: z.number().default(0),
    sortOrder: z.number().min(1),
    recipeSectionId: z.string().nullable()
})

export type IngredientModel = z.infer<typeof IngredientModelSchema>