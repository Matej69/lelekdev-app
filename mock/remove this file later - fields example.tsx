import React from "react"
import { useForm, useFieldArray, FormProvider, useFormContext } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const restaurantSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
})

const cookSchema = z.object({
  name: z.string().min(1),
  restaurants: z.array(restaurantSchema),
})

const recipeSchema = z.object({
  title: z.string().min(1),
  cooks: z.array(cookSchema),
})

const formSchema = z.object({
  recipes: z.array(recipeSchema),
})

type FormData = z.infer<typeof formSchema>

export default function RecipesForm() {
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipes: [],
    },
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(console.log)}>
        <RecipesFieldArray />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  )
}

function RecipesFieldArray() {
  const { control, register } = useFormContext<FormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipes",
  })

  return (
    <div>
      {fields.map((recipe, recipeIndex) => (
        <div key={recipe.id}>

          <input
            {...register(`recipes.${recipeIndex}.title`)}
            placeholder="Recipe title"
          />

          <CooksFieldArray recipeIndex={recipeIndex} />

          <button type="button" onClick={() => remove(recipeIndex)}>
            Remove Recipe
          </button>

        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ title: "", cooks: [] })}
      >
        Add Recipe
      </button>
    </div>
  )
}

function CooksFieldArray({ recipeIndex }: { recipeIndex: number }) {
  const { control, register } = useFormContext<FormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `recipes.${recipeIndex}.cooks`,
  })

  return (
    <div>
      {fields.map((cook, cookIndex) => (
        <div key={cook.id}>

          <input
            {...register(`recipes.${recipeIndex}.cooks.${cookIndex}.name`)}
            placeholder="Cook name"
          />

          <RestaurantsFieldArray
            recipeIndex={recipeIndex}
            cookIndex={cookIndex}
          />

          <button type="button" onClick={() => remove(cookIndex)}>
            Remove Cook
          </button>

        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({ name: "", restaurants: [] })
        }
      >
        Add Cook
      </button>
    </div>
  )
}

function RestaurantsFieldArray({
  recipeIndex,
  cookIndex,
}: {
  recipeIndex: number
  cookIndex: number
}) {
  const { control, register } = useFormContext<FormData>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `recipes.${recipeIndex}.cooks.${cookIndex}.restaurants`,
  })

  return (
    <div>
      {fields.map((restaurant, restIndex) => (
        <div key={restaurant.id}>

          <input
            {...register(
              `recipes.${recipeIndex}.cooks.${cookIndex}.restaurants.${restIndex}.name`
            )}
            placeholder="Restaurant name"
          />

          <input
            {...register(
              `recipes.${recipeIndex}.cooks.${cookIndex}.restaurants.${restIndex}.city`
            )}
            placeholder="City"
          />

          <button type="button" onClick={() => remove(restIndex)}>
            Remove Restaurant
          </button>

        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({ name: "", city: "" })
        }
      >
        Add Restaurant
      </button>
    </div>
  )
}